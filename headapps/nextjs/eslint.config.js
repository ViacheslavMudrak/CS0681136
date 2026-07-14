const { FlatCompat } = require('@eslint/eslintrc');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = [
  { ignores: ['.generated/**/*', '**/*.d.ts', '**/*.js'] },

  ...compat.extends('next', 'next/core-web-vitals'),

  ...tsPlugin.configs['flat/recommended'],

  {
    plugins: { prettier: prettierPlugin },
    rules: {
      '@next/next/no-img-element': 'off',
      'jsx-a11y/alt-text': ['warn', { elements: ['img'] }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { caughtErrorsIgnorePattern: '.' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'off',
      'jsx-quotes': ['error', 'prefer-double'],
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },

  prettierConfig,
];
