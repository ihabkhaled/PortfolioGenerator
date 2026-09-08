/**
 * Global ignore list. Everything else in the repository is linted.
 */

export default [
  {
    ignores: [
      'node_modules/',
      '.next/',
      'out/',
      'build/',
      'dist/',
      'coverage/',
      'test-results/',
      'playwright-report/',
      'blob-report/',
      'next-env.d.ts',
      'src/generated/',
      'prisma/migrations/',
      '.storage/',
      // Agent worktrees hold whole checkouts of this same repository, so
      // linting them reports every finding once per worktree, against code
      // that is not the working tree's.
      '.claude/',
    ],
  },
];
