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
    files: [
      'src/modules/storage/providers/local-object-storage.provider.ts',
      'support/*.mts',
      // The alias resolver stats candidate module paths built from an import
      // specifier that the TypeScript compiler has already resolved, and the
      // install scripts stat paths built from this repository's own directory
      // and a package name from its own manifest. All of them run at build time
      // in a checkout, never on a request, and none of them sees user input.
      'support/*.mjs',
    ],
    rules: {
      'security/detect-non-literal-fs-filename': 'off',
    },
  },
  {
    /**
     * EXC-0007 — the install and build scripts under support/.
     *
     * These are command-line programs. `no-console` exists so that application
     * code goes through the logger, and `no-process-exit` exists so that a
     * request handler cannot take the process down — neither applies to a
     * script whose entire interface is stdout and an exit status, and whose job
     * on a build machine is specifically to exit zero without doing anything.
     */
    files: ['support/**/*.{mjs,mts}'],
    rules: {
      'no-console': 'off',
      'unicorn/no-process-exit': 'off',
    },
  },
  {
    /**
     * EXC-0008 — support/ensure-database.mjs's CREATE DATABASE statement.
     *
     * Postgres has no bind-parameter syntax for a DDL identifier. The name is
     * escaped with `pg`'s own `Client#escapeIdentifier` — the library's
     * supported mechanism for exactly this — before it reaches the query
     * string, the same shape as EXC-0001's computed filesystem paths.
     */
    files: ['support/ensure-database.mjs'],
    rules: {
      'sonarjs/sql-queries': 'off',
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
     * EXC-0005 — the URL policy and its test.
     *
     * `sonarjs/no-clear-text-protocols` autofixes `http://` to `https://`. In
     * a test whose entire purpose is asserting that cleartext URLs are
     * *rejected*, that fixer quietly inverts the assertion — it did exactly
     * that once already, and the suite still passed. The policy itself names
     * `http:` in prose for the same reason.
     */
    files: ['src/tests/unit/safe-url.test.ts', 'src/shared/utils/safe-url.util.ts'],
    rules: {
      'sonarjs/no-clear-text-protocols': 'off',
      'unicorn/prefer-https': 'off',
    },
  },
  {
    /**
     * EXC-0006 — the renderer fixture matrix.
     *
     * A `<script type="application/ld+json">` body has no accessible role and
     * no text node Testing Library will return: its queries deliberately
     * ignore script content. Asserting that the JSON-LD payload reaches the
     * page unescaped therefore requires reading the node directly. The
     * alternative — asserting only the serializer in isolation — would leave
     * the one place the escaping actually matters untested.
     */
    files: ['src/tests/unit/portfolio-template.test.tsx'],
    rules: {
      'testing-library/no-container': 'off',
      'testing-library/no-node-access': 'off',
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
