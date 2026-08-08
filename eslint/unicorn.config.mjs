/**
 * Unicorn rules: recommended preset with project-fit adjustments.
 *
 * - prevent-abbreviations / name-replacements: off. Both rewrite identifiers
 *   toward "descriptive" forms that fight two conventions this repo depends
 *   on: idiomatic React/Next naming (`props`, `ref`, `env`, `src`) and the
 *   layered file suffixes the architecture plugin classifies on
 *   (`*.util.ts`, not `*.utility.ts`). A rule that renames the thing another
 *   rule keys on is a net loss.
 * - no-null: off — `null` is the schema's "known absent", and the whole
 *   document model is built on the distinction between null and missing.
 * - filename-case: kebab-case matches the architecture file conventions.
 */

import unicornPlugin from 'eslint-plugin-unicorn';

export default [
  {
    ...unicornPlugin.configs.recommended,
    files: ['**/*.{ts,tsx,mts,mjs}'],
  },
  {
    files: ['**/*.{ts,tsx,mts,mjs}'],
    rules: {
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/name-replacements': 'off',
      'unicorn/no-null': 'off',
      /**
       * Off: it rewrites domain verbs into worse English. A repository method
       * named `softDeleteOwnedPortfolio` that returns whether it deleted
       * anything becomes `hasSoftDeleteOwnedPortfolio`, and a boolean prop
       * `showPortrait` becomes `isShowPortrait`. The convention it enforces is
       * real; its application to props and command methods is not.
       */
      'unicorn/consistent-boolean-name': 'off',
      /**
       * Off: its autofix rewrites `'\\u003c'` into a `String.raw` template and
       * keeps both backslashes, turning a deliberate JSON escape into a
       * literal backslash. A rule that silently changes what a string *is*
       * cannot be allowed near the JSON-LD serializer.
       */
      'unicorn/prefer-string-raw': 'off',
      // Its autofix rewrites `/** One line. */` into a three-line block with no
      // leading asterisks, which is neither JSDoc nor readable. Comment layout
      // is Prettier's job.
      'unicorn/single-line-block-comment-style': 'off',
      // APIs like vi.stubGlobal require an explicit undefined argument; keep
      // the rule for useless returns/variables only.
      'unicorn/no-useless-undefined': ['error', { checkArguments: false }],
      // Next.js dynamic segments are directories named after the param they
      // bind (`[portfolioSlug]`), so the framework — not style — decides the
      // case there.
      'unicorn/filename-case': ['error', { case: 'kebabCase', ignore: [/^\[.+\]$/u] }],
      'unicorn/no-array-reduce': 'error',
      'unicorn/prefer-module': 'error',
    },
  },
  {
    files: ['**/*.cjs'],
    rules: {
      'unicorn/prefer-module': 'off',
    },
  },
];
