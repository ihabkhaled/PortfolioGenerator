/**
 * Package boundary map: every third-party vendor has exactly one owning
 * wrapper directory. This is the machine-readable twin of
 * context/package-boundaries.md — update both together.
 *
 * The point is not purity for its own sake. Model SDKs, PDF parsers, storage
 * clients and auth libraries are the fastest-moving dependencies in this
 * product; confining each to one file means a breaking upgrade is a one-file
 * change, not an archaeology project.
 */

import { portfolioArchitecturePlugin } from './architecture-plugin.mjs';

const packageBoundaries = [
  { package: 'zod', owners: ['src/packages/zod/'] },
  {
    package: '@prisma/client',
    owners: ['src/packages/database/'],
    allowInTests: true,
  },
  { package: 'better-auth', owners: ['src/packages/auth/'] },
  { package: 'ai', owners: ['src/packages/ai/'] },
  { package: '@ai-sdk/openai', owners: ['src/packages/ai/'] },
  { package: 'unpdf', owners: ['src/packages/pdf/'] },
  { package: 'aws4fetch', owners: ['src/packages/object-store/'] },
  { package: 'next-intl', owners: ['src/packages/i18n/'] },
  { package: 'sonner', owners: ['src/packages/toast/'] },
  { package: 'lucide-react', owners: ['src/packages/icons/'] },
  { package: 'react-hook-form', owners: ['src/packages/forms/'] },
  { package: '@hookform/resolvers', owners: ['src/packages/forms/'] },
  { package: 'clsx', owners: ['src/packages/ui-primitives/'] },
  { package: 'tailwind-merge', owners: ['src/packages/ui-primitives/'] },
  {
    package: 'class-variance-authority',
    owners: ['src/packages/ui-primitives/'],
  },
  {
    package: 'next/link',
    matchSubpaths: false,
    owners: ['src/packages/link/'],
  },
  {
    package: 'next/image',
    matchSubpaths: false,
    owners: ['src/packages/image/'],
  },
  {
    package: 'next/navigation',
    matchSubpaths: false,
    owners: ['src/packages/navigation/'],
  },
  {
    package: 'next/cache',
    matchSubpaths: false,
    owners: ['src/packages/cache/'],
  },
  {
    package: 'next/og',
    matchSubpaths: false,
    owners: ['src/packages/og/'],
  },
  {
    package: 'next/font/google',
    matchSubpaths: false,
    owners: ['src/shared/fonts/'],
  },
  {
    package: 'next/font/local',
    matchSubpaths: false,
    owners: ['src/shared/fonts/'],
  },
];

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'portfolio-architecture-boundaries': portfolioArchitecturePlugin,
    },
    rules: {
      'portfolio-architecture-boundaries/no-raw-package-imports': [
        'error',
        { boundaries: packageBoundaries },
      ],
    },
  },
];
