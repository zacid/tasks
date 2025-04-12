import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    return {
        // you can return any data you want here
    };
};

// This enables static site generation
export const prerender = true;

// This enables SPA mode
export const ssr = true; 