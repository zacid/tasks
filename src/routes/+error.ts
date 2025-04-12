import type { LoadEvent } from '@sveltejs/kit';

export function load({ params }: LoadEvent) {
    return {
        status: 500,
        error: new Error('Internal server error')
    };
} 