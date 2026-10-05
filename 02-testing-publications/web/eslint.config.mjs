import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import eslintReact from "@eslint-react/eslint-plugin";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";

export default defineConfig([
  // Global Ignores
  globalIgnores(["**/dist/", "**/vite.config.js"]),

  // Base ESLint JavaScript rules
  js.configs.recommended,

  // Add the native modern React rules
  eslintReact.configs.recommended,

  // Application Rules & Overrides
  {
    files: ["**/*.js", "**/*.jsx"],
    plugins: {
      "jsx-a11y": jsxA11yPlugin,
    },
    rules: {
      ...jsxA11yPlugin.configs.recommended.rules,
      // Disable base no-unused-vars in favor of React-aware versions
      "no-unused-vars": "off",
      "@eslint-react/no-unused-vars": "off",
      "@eslint-react/no-unused-state": "warn",
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },

  // Prettier Formatting (Always last)
  prettier,
]);
