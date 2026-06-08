import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/postcss';

export default defineConfig({
  plugins: [react()],
  /** Vite resolves PostCSS plugin strings differently than Next; use the plugin instance for tests only. */
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    /**
     * Node 25+ exposes a broken global `localStorage` (`clear` is not a function) that wins over jsdom.
     * Disable Node Web Storage in test workers so jsdom provides Storage (cookie-banner and similar suites).
     */
    pool: 'forks',
    execArgv: ['--no-webstorage'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        '.next/',
        '.sitecore/',
      ],
    },
  },
  resolve: {
    alias: [
      {
        find: /^src\/(.+)$/,
        replacement: `${path.resolve(__dirname, './src')}/$1`,
      },
      {
        find: 'sitecore.config',
        replacement: path.resolve(__dirname, './sitecore.config.ts'),
      },
      { find: 'components', replacement: path.resolve(__dirname, './src/components') },
      { find: 'lib', replacement: path.resolve(__dirname, './src/lib') },
      { find: 'temp', replacement: path.resolve(__dirname, './src/temp') },
      { find: 'assets', replacement: path.resolve(__dirname, './src/assets') },
      { find: '.sitecore', replacement: path.resolve(__dirname, './.sitecore') },
    ],
  },
});

