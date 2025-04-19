<script lang="ts">
    import { supabase } from '$lib/supabase';
    import { goto } from '$app/navigation';
    import { user } from '$lib/stores/auth';
    import { base } from '$app/paths';

    let email = '';
    let password = '';
    let isLoading = false;
    let error = '';
    let isSignUp = false;
    let message = '';

    // Redirect if already logged in
    $: if ($user) {
        goto(`${base}/`);
    }

    async function handleGitHubLogin() {
        isLoading = true;
        error = '';
        
        try {
            const { error: signInError } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: window.location.origin.includes('localhost') 
                        ? `${window.location.origin}${base}/auth/callback`
                        : 'https://zacid.github.io/tasks/auth/callback',
                    scopes: 'user:email'
                }
            });
            
            if (signInError) throw signInError;
        } catch (e: any) {
            error = e.message || 'Failed to sign in with GitHub';
            isLoading = false;
        }
    }

    async function handleAuth(e: SubmitEvent) {
        e.preventDefault();
        isLoading = true;
        error = '';
        message = '';

        try {
            if (isSignUp) {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (signUpError) throw signUpError;
                message = 'Check your email for the confirmation link!';
            } else {
                const { data, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
                if (data.user) {
                    goto(`${base}/`);
                }
            }
        } catch (e: any) {
            error = e.message || 'An error occurred';
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="min-h-screen p-6 font-mono bg-slate-900">
    <div class="max-w-md mx-auto">
        <header class="mb-8 flex justify-between items-center">
            <div>
                <h1 class="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h1>
                <p class="text-cyan-600 mt-2">// {isSignUp ? 'Sign up to start managing tasks' : 'Sign in to continue'}</p>
            </div>
            <button 
                on:click={() => goto(`${base}/`)}
                class="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
                ← Back
            </button>
        </header>

        <div class="bg-slate-800/30 p-6 rounded-lg border border-cyan-700">
            <form on:submit|preventDefault={handleAuth} class="space-y-4">
                <div>
                    <label for="email" class="block text-cyan-400 mb-1">Email</label>
                    <input
                        type="email"
                        id="email"
                        bind:value={email}
                        required
                        class="w-full bg-slate-900/50 border border-cyan-700 rounded-md p-2 text-cyan-300 placeholder-cyan-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        placeholder="your@email.com"
                    />
                </div>

                <div>
                    <label for="password" class="block text-cyan-400 mb-1">Password</label>
                    <input
                        type="password"
                        id="password"
                        bind:value={password}
                        required
                        minlength="6"
                        class="w-full bg-slate-900/50 border border-cyan-700 rounded-md p-2 text-cyan-300 placeholder-cyan-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        placeholder="••••••••"
                    />
                </div>

                {#if error}
                    <p class="text-red-400 text-sm">{error}</p>
                {/if}

                {#if message}
                    <p class="text-green-400 text-sm">{message}</p>
                {/if}

                <button
                    type="submit"
                    disabled={isLoading}
                    class="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 disabled:cursor-not-allowed text-slate-900 font-medium py-2 px-4 rounded transition-colors"
                >
                    {#if isLoading}
                        Loading...
                    {:else}
                        {isSignUp ? 'Sign Up' : 'Sign In'}
                    {/if}
                </button>

                <div class="relative py-3">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-cyan-700"></div>
                    </div>
                </div>

                <button
                    type="button"
                    on:click={handleGitHubLogin}
                    disabled={isLoading}
                    class="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded transition-colors"
                >
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    Continue with GitHub
                </button>

                <button
                    type="button"
                    on:click={() => {
                        isSignUp = !isSignUp;
                        error = '';
                        message = '';
                    }}
                    class="w-full text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
                >
                    {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                </button>
            </form>
        </div>
    </div>
</div> 