import type { Handle, HandleServerError } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    return resolve(event);
};

export const handleError: HandleServerError = ({ error }) => {
    console.error('Error during server operation:', error);
    return {
        message: 'Internal server error'
    };
}; 