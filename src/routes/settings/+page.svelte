<script lang="ts">
    import { user } from '$lib/stores/auth';
    import { settings, updateSettings } from '$lib/stores/settings';
    import { supabase } from '$lib/supabase';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { onMount } from 'svelte';

    let taskAgeDays = $settings.task_age_days;
    let saving = false;
    let error = '';

    onMount(() => {
        if (!$user) {
            goto(`${base}/`);
        }
    });

    async function handleSave() {
        saving = true;
        error = '';
        
        try {
            await updateSettings({ task_age_days: taskAgeDays });
            goto(`${base}/`);
        } catch (e) {
            error = 'Failed to save settings';
            saving = false;
        }
    }

    async function handleSignOut() {
        await supabase.auth.signOut();
        goto(`${base}/`);
    }
</script>

<div class="min-h-screen p-6 font-mono bg-slate-900">
    <div class="max-w-2xl mx-auto">
        <header class="mb-8 flex justify-between items-center">
            <div>
                <h1 class="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text">
                    SETTINGS
                </h1>
                <p class="text-cyan-600 mt-2">// Customize your task management</p>
            </div>
            <button 
                on:click={() => goto(`${base}/`)}
                class="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
                ← Back
            </button>
        </header>

        <div class="bg-slate-800/30 p-6 rounded-lg border border-cyan-800">
            <div class="space-y-6">
                <div>
                    <label for="taskAge" class="block text-cyan-400 mb-2">Task Age Limit (days)</label>
                    <input 
                        type="number" 
                        id="taskAge"
                        bind:value={taskAgeDays}
                        min="1"
                        max="30"
                        class="w-full bg-slate-800/50 border border-cyan-700 rounded-md p-2 text-cyan-300 placeholder-cyan-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    >
                    <p class="text-cyan-600 text-sm mt-1">Tasks older than this will be archived</p>
                </div>

                {#if error}
                    <p class="text-sm" class:text-red-400={error.includes('Failed')} class:text-green-400={error.includes('success')}>
                        {error}
                    </p>
                {/if}

                <div class="flex justify-between items-center pt-4 border-t border-slate-700">
                    <button 
                        on:click={handleSignOut}
                        class="text-red-400 hover:text-red-300 transition-colors"
                    >
                        Sign Out
                    </button>
                    <button 
                        on:click={handleSave}
                        disabled={saving}
                        class="bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 disabled:cursor-not-allowed text-slate-900 px-4 py-2 rounded transition-colors"
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    </div>
</div> 