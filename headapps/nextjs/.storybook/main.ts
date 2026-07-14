import type { StorybookConfig } from '@storybook/nextjs-vite';
import path, { resolve } from 'path';
import css from 'styled-jsx/css';
const { mergeConfig } = require('vite');

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  staticDirs: ['../public', './static'],
  async viteFinal(config) {
    const breakpointsPath = path
      .resolve(__dirname, '../src/assets/mixins/_breakpoints.scss')
      .replace(/\\/g, '/'); // convert backslashes to forward slashes
    const typographyPath = path
      .resolve(__dirname, '../src/assets/mixins/_typography.scss')
      .replace(/\\/g, '/'); // convert backslashes to forward slashes

    return mergeConfig(config, {
      css: {
        preprocessorOptions: {
          scss: {
            additionalData: `
            @use "${breakpointsPath}" as *;
            @use "${typographyPath}" as *;
          `,
          },
        },
      },
      resolve: {
        alias: {
          // whenever Storybook imports "reading-time",
          // use this simple mock instead of the real version
          'reading-time': resolve(__dirname, './reading-time-mock.ts'),
        },
      },
    });
  },
};
export default config;
