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
            <form on:submit={handleAuth} class="space-y-4">
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