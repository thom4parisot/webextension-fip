import js from '@eslint/js';
import promise from 'eslint-plugin-promise';
import globals from 'globals';

export default [
  {
    ignores: ['build/', 'dist/', '.claude/'],
  },
  js.configs.recommended,
  promise.configs['flat/recommended'],
  {
    rules: {
      'semi': 'warn',
      'no-unused-vars': ['error', { varsIgnorePattern: '(Service|Filters)$' }],
    },
  },
  {
    files: ['src/**'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        // replaced at build time
        process: 'readonly',
      },
    },
  },
  {
    files: ['**/*.test.js', 'scripts/**', '*.config.js', '*.config.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
];
