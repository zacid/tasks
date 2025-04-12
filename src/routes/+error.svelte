<script>
    import { page } from '$app/stores';
</script>

<div class="flex min-h-screen items-center justify-center">
    <div class="text-center">
        <h1 class="text-4xl font-bold mb-4">
            {$page.status}: {$page.error?.message || 'Something went wrong'}
        </h1>
        <p class="mb-4">We're sorry, but something went wrong.</p>
        <a href="/" class="text-blue-500 hover:text-blue-700">Go back home</a>
    </div>
</div> 