import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    pool: 'forks',
    poolOptions: {
      forks: {
        execArgv: ['--max-old-space-size=8192'],
      },
    },
    include: [
      // Only include tests for core components
      'src/__tests__/components/core/**/*.{test,spec}.{js,ts,jsx,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/src/__tests__/components/core/Auth/octa-widget/**',
    ],
    coverage: {
      provider: 'v8',
      // Work around test-exclude/glob runtime incompatibility in this dependency graph.
      // Keeping `all` false skips the untested-files glob pass that crashes coverage.
      all: false,
      reporter: ['text', 'json', 'html'],
      // Only collect coverage for core components
      include: ['src/components/core/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.type.ts',
        '**/*.config.*',
        '**/mockData/**',
        '.next/',
        '.sitecore/',
        '**/__tests__/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        // Exclude CSS and module files from coverage
        '**/*.module.css',
        '**/*.css',
        '**/src/components/core/Auth/octa-widget/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
      components: path.resolve(process.cwd(), './src/components'),
      lib: path.resolve(process.cwd(), './src/lib'),
      temp: path.resolve(process.cwd(), './src/temp'),
      assets: path.resolve(process.cwd(), './src/assets'),
      '.sitecore': path.resolve(process.cwd(), './.sitecore'),
      src: path.resolve(process.cwd(), './src'),
      'sitecore.config': path.resolve(process.cwd(), './sitecore.config.ts'),
    },
  },
});

