import js from '@eslint/js';
import promise from 'eslint-plugin-promise';
import globals from 'globals';

export default [
  {
    ignores: ['build/'],
  },
  js.configs.recommended,
  promise.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.webextensions,
      },
    },
    rules: {
      'semi': 'warn',
      'no-undef': 'error',
      'no-unused-vars': ['error', { varsIgnorePattern: '(Service|Filters)$' }],
    },
  },
];
