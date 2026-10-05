import js from "@eslint/js";
import globals from "globals";
import reactPlugin from "@eslint-react/eslint-plugin";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import prettierConfig from "eslint-config-prettier";

export default [
  // 1. Tell ESLint which folder environments to ignore completely
  {
    ignores: ["dist/**", "node_modules/**"],
  },

  // 2. Base JavaScript and global environment setups
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser, // Gives support for 'window', 'document', etc.
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Enables parsing of JSX syntax
        },
      },
    },
  },

  // 3. React Specific Core Linting Configurations
  {
    files: ["**/*.{js,jsx}"],
    plugins: {
      "@eslint-react": reactPlugin,
    },
    rules: {
      "@eslint-react/no-direct-mutation-state": "error",
    },
  },

  // 4. JSX Accessibility (a11y) Checks Setup
  {
    files: ["**/*.{js,jsx}"],
    plugins: {
      "jsx-a11y": jsxA11yPlugin,
    },
    rules: {
      // Safely imports recommended accessibility guidelines
      ...jsxA11yPlugin.configs.recommended.rules, 
      
      // Enforce mandatory alt descriptions for images
      "jsx-a11y/alt-text": "error", 
    },
  },

  // 5. Prettier Formatting Integration (Must always be placed last)
  prettierConfig,
];
