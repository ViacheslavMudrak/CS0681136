// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import tsParser from "@typescript-eslint/parser";
import nextPlugin from "@next/eslint-plugin-next";
import storybook from "eslint-plugin-storybook";

/**
 * Use {@link nextPlugin.flatConfig} instead of FlatCompat + legacy `eslint-config-next` strings.
 * FlatCompat triggers ESLint 9 errors (`defaultMeta` / config cache) with Next’s parser metadata.
 */
const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Excluded from app `tsconfig` (PR #440); Storybook validates these via its own pipeline.
      "src/stories/**",
      "src/storybook/**",
      // Webpack `NormalModuleReplacementPlugin` forks; comments reference TS-eslint rules we do not load in flat config.
      "src/patches/**",
    ],
  },
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
  },
  nextPlugin.flatConfig.coreWebVitals,
  {
    rules: {
      // Don't force alt for <Image/> (sourced from Sitecore media)
      "jsx-a11y/alt-text": "off",
    },
  },
  ...storybook.configs["flat/recommended"],
];

export default eslintConfig;
