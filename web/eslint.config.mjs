import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint"; // 1. Import typescript-eslint
import react from "eslint-plugin-react";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";

export default defineConfig([
  // Global Ignores
  globalIgnores(["**/dist/", "**/vite.config.js"]),

  // Base ESLint JavaScript rules
  js.configs.recommended,

  // 2. TypeScript recommended rules (handles parsing for .ts/.tsx automatically)
  ...tseslint.configs.recommended,

  // Application Rules (React + Accessibility)
  {
    // 3. Update files array to include ts and tsx
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    plugins: {
      react,
      "jsx-a11y": jsxA11yPlugin,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...jsxA11yPlugin.configs.recommended.rules,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // Prettier Formatting (Always last)
  prettier,
]);
