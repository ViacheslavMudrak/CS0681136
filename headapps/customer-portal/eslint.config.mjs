import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Don't force alt for <Image/> (sourced from Sitecore media)
      "jsx-a11y/alt-text": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts"
    ]
  },
  {
    files: ["src/**/*.{tsx,jsx}"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "Literal[value=/bg-\\[#[0-9a-fA-F]{3,8}\\]/]",
          message:
            "Avoid arbitrary hex backgrounds; use design-system Tailwind tokens (see .cursor/rules/general.mdc)."
        },
        {
          selector: "Literal[value=/text-gray-/]",
          message:
            "Prefer design text tokens (text-text-basic, text-text-heading) over text-gray-*."
        }
      ]
    }
  }
];

export default eslintConfig;
