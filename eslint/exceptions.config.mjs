/**
 * Documented, file-scoped rule exceptions.
 *
 * `eslint-disable` comments are banned by policy: they hide in a diff and
 * outlive the reason they were added. Every exception the repository has lives
 * here instead, next to the rationale, and each one has a matching entry in
 * docs/exceptions/.
 *
 * This config is applied near the end of the composition on purpose. Several
 * plugin presets re-enable core rules (eslint-plugin-regexp turns
 * `no-control-regex` back on, for example), so an exception placed earlier
 * would be silently overwritten.
 */

export default [
  {
    /**
     * EXC-0002 — src/shared/constants/text.constants.ts
     *
     * This file exists to match control characters. `no-control-regex` is
     * asking it not to do the one thing it is for; `control-character-escape`
     * would mix `\v`/`\f` into an otherwise uniform `\uXXXX` class, and
     * `prefer-unicode-code-point-escapes` would rewrite it as `\u{...}` —
     * both make the range boundaries harder to verify, which is the only
     * property that matters in a security-relevant character class.
     */
    files: ['src/shared/constants/text.constants.ts'],
    rules: {
      'no-control-regex': 'off',
      'regexp/control-character-escape': 'off',
      'unicorn/prefer-unicode-code-point-escapes': 'off',
    },
  },
  {
    /**
     * EXC-0001 — the local object-storage adapter and build scripts.
     *
     * These are the only places that touch the filesystem with a computed
     * name. Storage keys are generated server-side from crypto randomness and
     * validated against a strict pattern before any call; user input never
     * reaches these paths.
     */
    files: ['src/modules/storage/providers/local-object-storage.provider.ts', 'support/*.mts'],
    rules: {
      'security/detect-non-literal-fs-filename': 'off',
    },
  },
  {
    /**
     * EXC-0003 — the logger wrapper is the single owner of console output.
     */
    files: ['src/packages/logger/**'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    /**
     * EXC-0004 — src/packages/link/index.tsx
     *
     * `toAppRoute` widens a database-derived path to the branded `Route` type
     * that `typedRoutes` generates. The two compilers this repo runs disagree
     * about it: TypeScript 7 requires the assertion, while the TypeScript 6 API
     * typescript-eslint runs on resolves `Route` to `string` and calls the
     * assertion unnecessary. The TS7 typecheck is the gate that matters, so the
     * lint rule yields for this one file.
     */
    files: ['src/packages/link/index.tsx'],
    rules: {
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    },
  },
];
