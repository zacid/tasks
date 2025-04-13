<script lang="ts">
  import { onMount } from 'svelte';
  import Task from '$lib/components/Task.svelte';
  import { supabase, type Task as TaskType } from '$lib/supabase';
  import { slide } from 'svelte/transition';
  import { user } from '$lib/stores/auth';
  import { settings } from '$lib/stores/settings';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';

  let tasks: TaskType[] = [];
  let archivedTasks: TaskType[] = [];
  let completedTasks: TaskType[] = [];
  let newTaskContent = '';
  let isArchivedExpanded = false;
  let isCompletedExpanded = false;

  interface CompleteTaskEvent extends CustomEvent<string> {
    detail: string;
  }

  // Watch for user changes and load tasks accordingly
  $: if ($user) {
    loadTasks();
  } else {
    tasks = [];
    archivedTasks = [];
    completedTasks = [];
  }

  onMount(() => {
    // Set up periodic refresh of tasks
    const refreshInterval = setInterval(loadTasks, 1000 * 60 * 60);
    return () => clearInterval(refreshInterval);
  });

  function sortByDate(a: TaskType, b: TaskType, dateField: keyof TaskType = 'created_at'): number {
    return new Date(b[dateField] as string).getTime() - new Date(a[dateField] as string).getTime();
  }

  function sortByAgeAndDate(a: TaskType, b: TaskType): number {
    const ageA = calculateAge(a.created_at);
    const ageB = calculateAge(b.created_at);
    return ageA !== ageB ? ageA - ageB : sortByDate(a, b);
  }

  async function loadTasks() {
    if (!$user) return;
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', $user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const allTasks = data || [];
      
      // Separate tasks into categories
      completedTasks = allTasks.filter(task => task.completed_at !== null);
      const activeTasks = allTasks.filter(task => task.completed_at === null);
      
      // Separate active tasks by age
      tasks = activeTasks.filter(task => calculateAge(task.created_at) < $settings.task_age_days);
      archivedTasks = activeTasks.filter(task => calculateAge(task.created_at) >= $settings.task_age_days);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }

  async function handleSubmit() {
    if (!newTaskContent.trim() || !$user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ 
          content: newTaskContent.trim(),
          user_id: $user.id
        }])
        .select()
        .single();

      if (error) throw error;
      tasks = [data, ...tasks];
      newTaskContent = '';
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  async function completeTask(event: CompleteTaskEvent) {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', event.detail);

      if (error) throw error;
      await loadTasks();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  }

  function calculateAge(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    
    const createdDate = new Date(created.getFullYear(), created.getMonth(), created.getDate());
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = Math.abs(todayDate.getTime() - createdDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  function getAgeLabel(age: number): string {
    if (age === 0) return 'Today';
    if (age === 1) return 'Yesterday';
    return `${age} Days Old`;
  }

  $: sortedTasks = tasks.sort(sortByAgeAndDate);
  $: sortedArchivedTasks = archivedTasks.sort(sortByDate);
  $: sortedCompletedTasks = completedTasks.sort((a, b) => sortByDate(a, b, 'completed_at'));

  function handleNavigation(path: string) {
    goto(`${base}${path}`);
  }
</script>

<div class="min-h-screen p-6 font-mono bg-slate-900">
  <div class="max-w-2xl mx-auto">
    <!-- Header -->
    <header class="mb-8">
      <div class="flex justify-between items-start mb-2">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text">
          TASK ROLLOVER
        </h1>
        {#if $user}
          <button 
            on:click={() => handleNavigation('/settings')}
            class="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ⚙️ Settings
          </button>
        {:else}
          <button 
            on:click={() => handleNavigation('/auth')}
            class="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Sign In
          </button>
        {/if}
      </div>
      <p class="text-cyan-600">// Tasks carry over until completed</p>
    </header>

    {#if $user}
      <!-- Task Input Form -->
      <div class="mb-8">
        <form on:submit|preventDefault={handleSubmit} class="relative">
          <input 
            type="text"
            bind:value={newTaskContent}
            placeholder="What needs to be done?"
            class="w-full bg-slate-800/50 border border-cyan-700 rounded-md p-4 pr-24 text-cyan-300 placeholder-cyan-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            required
          >
          <button 
            type="submit"
            class="absolute right-2 top-2 bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-medium px-4 py-2 rounded transition-colors"
          >
            ADD
          </button>
        </form>
      </div>

      <!-- Task Lists -->
      <div class="space-y-6">
        <!-- Active Tasks -->
        <div>
          <h2 class="text-xl font-bold text-cyan-400 mb-4">Active Tasks</h2>
          <div class="space-y-2">
            {#each sortedTasks as task}
              {@const age = calculateAge(task.created_at)}
              <Task 
                {task} 
                isWarning={age === $settings.task_age_days} 
                on:complete={completeTask}
                ageLabel={getAgeLabel(age)}
              />
            {/each}
          </div>
        </div>

        <!-- Completed Tasks Section -->
        {#if sortedCompletedTasks.length > 0}
          <div class="border-t border-slate-800 pt-6">
            <button
              class="flex items-center space-x-2 text-xl font-bold text-green-400 hover:text-green-300 transition-colors"
              on:click={() => isCompletedExpanded = !isCompletedExpanded}
            >
              <span class="transform transition-transform duration-200" class:rotate-90={isCompletedExpanded}>▶</span>
              <span>Completed Tasks ({sortedCompletedTasks.length})</span>
            </button>
            
            {#if isCompletedExpanded}
              <div class="space-y-2 mt-4" transition:slide>
                {#each sortedCompletedTasks as task}
                  {@const age = calculateAge(task.created_at)}
                  <Task 
                    {task} 
                    isCompleted={true}
                    on:complete={completeTask}
                    ageLabel={getAgeLabel(age)}
                  />
                {/each}
              </div>
            {/if}
          </div>
        {/if}

        <!-- Archived Tasks Section -->
        {#if sortedArchivedTasks.length > 0}
          <div class="border-t border-slate-800 pt-6">
            <button
              class="flex items-center space-x-2 text-xl font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
              on:click={() => isArchivedExpanded = !isArchivedExpanded}
            >
              <span class="transform transition-transform duration-200" class:rotate-90={isArchivedExpanded}>▶</span>
              <span>Archived Tasks ({sortedArchivedTasks.length})</span>
            </button>
            
            {#if isArchivedExpanded}
              <div class="space-y-2 mt-4" transition:slide>
                {#each sortedArchivedTasks as task}
                  {@const age = calculateAge(task.created_at)}
                  <Task 
                    {task} 
                    isWarning={true}
                    on:complete={completeTask}
                    ageLabel={getAgeLabel(age)}
                  />
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {:else}
      <div class="text-center text-cyan-400 py-12">
        <h2 class="text-2xl font-bold mb-4">Welcome to Task Rollover</h2>
        <p class="mb-6">A task manager that helps you stay focused on what matters.</p>
        <div class="space-y-4">
          <div class="bg-slate-800/30 p-4 rounded-lg border border-cyan-700 max-w-md mx-auto">
            <h3 class="text-lg font-bold mb-2">Features:</h3>
            <ul class="text-left space-y-2 text-cyan-300">
              <li>• Task aging system</li>
              <li>• Automatic archiving</li>
              <li>• Customizable settings</li>
            </ul>
          </div>
          <button 
            on:click={() => handleNavigation('/auth')}
            class="bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-medium px-6 py-2 rounded transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
