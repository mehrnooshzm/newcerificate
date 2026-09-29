import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']), // Ignore the build/output folder
  {
    files: ['**/*.{js,jsx}'], // Apply to all JS and JSX files
    extends: [
      js.configs.recommended, // Base recommended JS rules
      reactHooks.configs['recommended-latest'], // React Hooks rules
      reactRefresh.configs.vite, // React Refresh (Vite) rules
    ],
    languageOptions: {
      ecmaVersion: 2020, // ECMAScript version
      globals: globals.browser, // Browser globals
      parserOptions: {
        ecmaVersion: 'latest', // Parse latest JS features
        ecmaFeatures: { jsx: true }, // Enable JSX parsing
        sourceType: 'module', // ES modules
      },
      'plugins': ['react'], // React plugin
      'extends': ['plugin:react/recommended'], // Recommended React rules
    },
    rules: {
      // Ignore unused vars if they start with uppercase or underscore
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
]);
