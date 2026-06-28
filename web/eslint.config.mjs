import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintReact from "@eslint-react/eslint-plugin"; // 1. Swapped plugin import
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";

export default defineConfig([
  // Global Ignores
  globalIgnores(["**/dist/", "**/vite.config.js"]),

  // Base ESLint JavaScript rules
  js.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // 2. Add the native modern React rules
  eslintReact.configs.recommended,

  // Application Rules & Overrides
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    plugins: {
      "jsx-a11y": jsxA11yPlugin,
    },
    rules: {
      ...jsxA11yPlugin.configs.recommended.rules,

      // Custom overrides go here if needed
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    // 3. Removed the settings.react block entirely (no more version crashes!)
  },

  // Prettier Formatting (Always last)
  prettier,
]);
