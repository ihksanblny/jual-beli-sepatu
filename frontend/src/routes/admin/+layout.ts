// Disable server-side rendering for the admin panel.
// This ensures that authentication checks run purely on the client before anything is rendered,
// preventing any flash of unauthorized content.
export const ssr = false;
export const prerender = false;
