<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { supabase } from '$lib/supabase';

    let error = '';
    let isLoading = true;
    let debugInfo = '';

    onMount(async () => {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const errorDescription = url.searchParams.get('error_description');
        const provider_token = url.searchParams.get('provider_token');
        
        // Debug logging
        console.log('URL:', window.location.href);
        console.log('Code:', code);
        console.log('Error description:', errorDescription);
        
        if (code) {
            try {
                // Get the existing session first
                const { data: { session: existingSession } } = await supabase.auth.getSession();
                
                if (existingSession) {
                    console.log('Existing session found');
                    goto(`${base}/`);
                    return;
                }

                console.log('Exchanging code for session...');
                const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);
                
                if (authError) {
                    console.error('Auth error:', authError);
                    throw authError;
                }
                
                if (data?.session) {
                    console.log('Session obtained successfully');
                    goto(`${base}/`);
                    return;
                } else {
                    console.error('No session in response');
                    error = 'No session data received';
                }
            } catch (e: any) {
                console.error('Auth callback error:', e);
                error = e.message || 'Failed to complete authentication';
                debugInfo = JSON.stringify(e, null, 2);
                isLoading = false;
            }
        } else if (errorDescription) {
            error = errorDescription;
            isLoading = false;
        } else {
            error = 'No authentication code received';
            isLoading = false;
        }
    });
</script>

<div class="min-h-screen p-6 font-mono bg-slate-900 flex items-center justify-center">
    <div class="text-center max-w-md w-full">
        {#if error}
            <div class="bg-slate-800/30 p-6 rounded-lg border border-cyan-700">
                <p class="text-red-400 mb-4">{error}</p>
                {#if debugInfo}
                    <pre class="text-left text-xs text-gray-400 mt-4 p-2 bg-slate-900/50 rounded overflow-x-auto">
                        {debugInfo}
                    </pre>
                {/if}
                <button 
                    on:click={() => goto(`${base}/auth`)}
                    class="text-cyan-400 hover:text-cyan-300 transition-colors mt-4"
                >
                    ← Back to Sign In
                </button>
            </div>
        {:else if isLoading}
            <div class="flex flex-col items-center gap-4">
                <div class="w-16 h-16 border-4 border-t-cyan-400 border-cyan-800 rounded-full animate-spin"></div>
                <p class="text-cyan-400">Completing sign in...</p>
            </div>
        {/if}
    </div>
</div> 