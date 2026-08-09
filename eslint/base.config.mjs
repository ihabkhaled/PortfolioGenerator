/**
 * Base JavaScript rules for every linted file, plus language options for the
 * few CommonJS config files (commitlint, lint-staged).
 */

import js from '@eslint/js';

export default [
  {
    /** The service worker runs in a WorkerGlobalScope rather than Window or Node. */
    files: ['public/sw.js'],
    languageOptions: {
      globals: {
        URL: 'readonly',
        caches: 'readonly',
        fetch: 'readonly',
        self: 'readonly',
      },
    },
  },
  {
    ...js.configs.recommended,
    files: ['**/*.{js,mjs,cjs,ts,tsx,mts}'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx,mts}'],
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      // Console output goes through the logger facade (src/packages/logger).
      'no-console': 'error',
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'object-shorthand': ['error', 'always'],
    },
  },
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        module: 'writable',
        require: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
      },
    },
  },
  {
    /**
     * Build and maintenance scripts run in Node, not in a browser or a bundle,
     * so the platform globals they use are declared here rather than pulled in
     * as a dependency for four names.
     */
    files: ['support/**/*.{mjs,mts}', 'eslint/**/*.mjs'],
    languageOptions: {
      globals: {
        Buffer: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        performance: 'readonly',
        process: 'readonly',
        structuredClone: 'readonly',
      },
    },
  },
];
