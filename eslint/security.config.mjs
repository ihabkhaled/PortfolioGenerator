/**
 * Security rules from eslint-plugin-security.
 *
 * `detect-object-injection` is intentionally off: it flags every computed
 * property access and produces near-100% false positives in typed code.
 * Object-injection risk is instead controlled by TypeScript strictness
 * (noPropertyAccessFromIndexSignature, noUncheckedIndexedAccess) and the
 * Zod-validated boundaries. Documented in docs/exceptions/README.md.
 */

import securityPlugin from 'eslint-plugin-security';

export default [
  {
    ...securityPlugin.configs.recommended,
    files: ['**/*.{ts,tsx,mts,mjs}'],
  },
  {
    files: ['**/*.{ts,tsx,mts,mjs}'],
    rules: {
      'security/detect-object-injection': 'off',
    },
  },
  {
    /**
     * EXC-0001: the local object-storage adapter is the one place that touches
     * the filesystem with a computed name. Keys are generated server-side from
     * crypto randomness and validated against a strict pattern before any call;
     * user input never reaches these paths. See docs/exceptions/.
     */
    files: ['src/modules/storage/providers/local-object-storage.provider.ts', 'support/*.mts'],
    rules: {
      'security/detect-non-literal-fs-filename': 'off',
    },
  },
];
