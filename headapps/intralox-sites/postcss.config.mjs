/**
 * Next.js only accepts PostCSS plugins as string names or [name, options] tuples
 * (see https://nextjs.org/docs/messages/postcss-shape). Pre-instantiated plugins
 * break `next/font` and CSS compilation with "unknown PostCSS plugin ([object Object])".
 * Vitest/Vite resolve string plugin names via postcss-load-config as well.
 */
export default {
  plugins: ['@tailwindcss/postcss'],
};
