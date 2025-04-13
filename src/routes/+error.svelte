<script lang="ts">
    import { page } from '$app/stores';
    import { base } from '$app/paths';
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
    <div class="text-center p-8 rounded-lg shadow-lg bg-white">
        <h1 class="text-4xl font-bold text-gray-800 mb-4">
            {$page.status}: {$page.error?.message || 'Something went wrong'}
        </h1>
        <p class="mb-6 text-gray-600">We apologize for the inconvenience.</p>
        <a 
            href="{base}/"
            class="inline-block px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
            Go back home
        </a>
    </div>
</div> 