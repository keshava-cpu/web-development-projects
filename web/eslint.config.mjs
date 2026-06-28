import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";

export default defineConfig([
  // Global Ignores
  globalIgnores(["**/dist/", "**/vite.config.js"]),

  // Base ESLint JavaScript rules
  js.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // 1. Native Flat Configs for React
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],

  // Application Rules & Overrides
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    plugins: {
      "jsx-a11y": jsxA11yPlugin,
    },
    rules: {
      // Add accessibility rules
      ...jsxA11yPlugin.configs.recommended.rules,

      // Put any custom rule overrides here (e.g., "react/prop-types": "off")
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
