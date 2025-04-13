// We're using SPA mode for GitHub Pages
export const prerender = true;
export const ssr = false; // Disable SSR for GitHub Pages
export const csr = true; // Enable client-side rendering 

// Ensure base path is handled correctly
export const trailingSlash = 'always'; 