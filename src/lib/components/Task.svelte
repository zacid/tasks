<script lang="ts">
    import type { Task } from '$lib/supabase';
    import { createEventDispatcher } from 'svelte';
    import { supabase } from '$lib/supabase';

    export let task: Task;
    export let isWarning = false;
    export let ageLabel: string;
    export let isCompleted = false;

    const dispatch = createEventDispatcher();
    let isEditing = false;
    let editContent = task.content;

    function handleComplete() {
        dispatch('complete', task.id);
    }

    async function handleEdit() {
        if (!isCompleted) {
            isEditing = true;
            editContent = task.content;
        }
    }

    async function handleSave() {
        if (editContent.trim() === '') return;
        
        try {
            const { error } = await supabase
                .from('tasks')
                .update({ content: editContent.trim() })
                .eq('id', task.id);

            if (error) throw error;
            task.content = editContent.trim();
            isEditing = false;
        } catch (error) {
            console.error('Error updating task:', error);
        }
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            handleSave();
        } else if (event.key === 'Escape') {
            isEditing = false;
            editContent = task.content;
        }
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
>
    {#if isEditing}
        <input
            type="text"
            bind:value={editContent}
            on:keydown={handleKeyDown}
            on:blur={handleSave}
            class="flex-1 bg-slate-700/50 text-cyan-300 px-2 py-1 rounded border border-cyan-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
        />
    {:else}
        <button 
            type="button"
            class="text-left text-cyan-300 hover:text-cyan-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-1"
            on:click={handleEdit}
            on:keydown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleEdit();
                }
            }}
            disabled={isCompleted}
        >{task.content}</button>
    {/if}
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