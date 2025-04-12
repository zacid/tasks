<script lang="ts">
    import type { Task } from '$lib/supabase';
    import { createEventDispatcher } from 'svelte';
    import { fade } from 'svelte/transition';

    export let task: Task;
    export let isWarning = false;
    export let ageLabel: string;
    export let isCompleted = false;

    const dispatch = createEventDispatcher();

    function handleComplete() {
        dispatch('complete', task.id);
    }

    function calculateAge(createdAt: string): number {
        const created = new Date(createdAt);
        const now = new Date();
        
        // Reset times to midnight for comparison
        const createdDate = new Date(created.getFullYear(), created.getMonth(), created.getDate());
        const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // If it's before today (midnight), it's at least a day old
        if (createdDate < todayDate) {
            const diffTime = Math.abs(todayDate.getTime() - createdDate.getTime());
            return Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }
        
        return 0; // Created today
    }
</script>

<div 
    class="flex items-center justify-between bg-slate-800/30 hover:bg-slate-800/50 border-l-2 
    {isCompleted ? 'border-green-600 opacity-50' : isWarning ? 'border-yellow-600' : 'border-cyan-600'} 
    p-4 rounded-r-md transition-all"
    transition:fade
>
    <span class="text-cyan-300">{task.content}</span>
    <div class="flex items-center space-x-4">
        <span class="text-sm {isWarning ? 'text-yellow-600' : 'text-cyan-600'}">{ageLabel}</span>
        {#if !isCompleted}
            <button 
                on:click={handleComplete}
                class="bg-cyan-600 hover:bg-cyan-500 text-slate-900 px-3 py-1 rounded text-sm transition-colors"
            >
                Done
            </button>
        {/if}
    </div>
</div> 