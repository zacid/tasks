import type { HandleServerError } from '@sveltejs/kit';

export const prerender = true;

// Handle any errors that occur during prerendering
export const handleError: HandleServerError = ({ error, status }) => {
    console.error('Error during prerendering:', error);
    return {
        status: status ?? 500,
        message: error instanceof Error ? error.message : 'Internal server error'
    };
} 