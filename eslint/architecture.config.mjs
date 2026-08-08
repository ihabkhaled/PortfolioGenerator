/**
 * Architecture enforcement: registers the local portfolio-architecture plugin
 * and supplies the one-way layer policy table from
 * rules/01-next-app-router-architecture.md.
 *
 * The dependency direction is: actions → services → repositories/providers →
 * mappers/schemas/policies/types/constants. Containers and hooks sit on the
 * view side and reach services only through actions. Nothing below the view
 * layer may import React.
 */

import { portfolioArchitecturePlugin } from './architecture-plugin.mjs';

/** Layer ids come from eslint/architecture-plugin/shared/policy-utils.mjs. */
const layerPolicies = [
  {
    from: 'module-components',
    forbid: [
      'module-hooks',
      'module-actions',
      'module-services',
      'module-repositories',
      'module-providers',
      'module-store',
      'app',
    ],
    message: 'Components receive computed props; behavior lives in containers and hooks.',
  },
  {
    from: 'module-hooks',
    forbid: [
      'module-components',
      'module-containers',
      'module-repositories',
      'module-providers',
      'app',
    ],
    message:
      'Hooks orchestrate state and call server actions; they never reach the view layer or the database.',
  },
  {
    from: 'module-containers',
    forbid: ['module-services', 'module-repositories', 'module-providers', 'app'],
    message:
      'Containers consume hooks and server actions, never services, repositories or providers directly.',
  },
  {
    from: 'module-actions',
    forbid: ['module-components', 'module-containers', 'module-hooks', 'module-store', 'app'],
    message:
      'Server actions are the authorization boundary: they validate input, resolve the owner, and delegate to services. No view code here.',
  },
  {
    from: 'module-services',
    forbid: [
      'module-components',
      'module-containers',
      'module-hooks',
      'module-store',
      'module-actions',
      'app',
    ],
    message: 'Services are React-free use cases; they depend on repositories and providers only.',
  },
  {
    from: ['module-repositories', 'module-providers'],
    forbid: [
      'module-components',
      'module-containers',
      'module-hooks',
      'module-store',
      'module-actions',
      'module-services',
      'app',
    ],
    message:
      'Repositories and providers are infrastructure adapters; they never call back up into use cases or the view.',
  },
  {
    from: 'module-store',
    forbid: [
      'module-components',
      'module-containers',
      'module-services',
      'module-repositories',
      'module-providers',
      'module-actions',
      'app',
    ],
    message: 'Stores hold client state only; server data belongs to the server.',
  },
  {
    from: [
      'module-utils',
      'module-helpers',
      'module-mappers',
      'module-schemas',
      'module-policies',
    ],
    forbid: [
      'module-components',
      'module-containers',
      'module-hooks',
      'module-actions',
      'module-services',
      'module-repositories',
      'module-providers',
      'module-store',
      'app',
    ],
    message: 'Pure logic layers depend only on types, constants, enums and other pure logic.',
  },
  {
    from: 'shared',
    forbid: [
      'module-root',
      'module-actions',
      'module-api',
      'module-gateway',
      'module-services',
      'module-repositories',
      'module-providers',
      'module-policies',
      'module-queries',
      'module-store',
      'module-containers',
      'module-components',
      'module-hooks',
      'module-utils',
      'module-helpers',
      'module-mappers',
      'module-schemas',
      'module-types',
      'module-enums',
      'module-constants',
      'module-test',
      'app',
    ],
    message: 'Shared code is generic; it must never know about feature modules or routes.',
  },
  {
    from: 'packages',
    forbid: [
      'module-root',
      'module-actions',
      'module-api',
      'module-gateway',
      'module-services',
      'module-repositories',
      'module-providers',
      'module-policies',
      'module-queries',
      'module-store',
      'module-containers',
      'module-components',
      'module-hooks',
      'module-utils',
      'module-helpers',
      'module-mappers',
      'module-schemas',
      'module-types',
      'module-enums',
      'module-constants',
      'module-test',
      'shared',
      'app',
    ],
    message: 'Package wrappers own one vendor and expose a facade; they sit below every layer.',
  },
];

/**
 * Everything the public portfolio render path may never import. A published
 * portfolio has to render when the AI provider, the PDF parser and object
 * storage are all unavailable — and none of that code may reach the browser
 * bundle of a page that anonymous visitors load.
 */
const authoringOnlyDependencies = [
  '@/modules/ai',
  '@modules/ai',
  '@/modules/resume-ingestion',
  '@modules/resume-ingestion',
  '@/modules/portfolio-editor',
  '@modules/portfolio-editor',
  '@/modules/storage',
  '@modules/storage',
  '@/packages/ai',
  '@packages/ai',
  '@/packages/pdf',
  '@packages/pdf',
  '@/packages/auth',
  '@packages/auth',
  'ai',
  '@ai-sdk/openai',
  'unpdf',
  'better-auth',
  'aws4fetch',
];

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'portfolio-architecture': portfolioArchitecturePlugin,
    },
    rules: {
      'portfolio-architecture/no-hooks-in-components': 'error',
      'portfolio-architecture/no-inline-declarations': 'error',
      'portfolio-architecture/no-inline-component-logic': 'error',
      'portfolio-architecture/no-restricted-layer-imports': ['error', { policies: layerPolicies }],
      'portfolio-architecture/no-cross-module-deep-imports': 'error',
      'portfolio-architecture/no-process-env-outside-config': [
        'error',
        {
          allowedPrefixes: ['src/packages/env/', 'src/tests/setup/', 'src/tests/e2e/', 'src/proxy.ts'],
        },
      ],
      'portfolio-architecture/no-direct-browser-api-outside-packages': 'error',
      'portfolio-architecture/no-raw-i18n-text': 'error',
      'portfolio-architecture/no-react-in-pure-layers': 'error',
      'portfolio-architecture/no-inline-classname-outside-design-system': 'error',
      'portfolio-architecture/require-client-component-reason': 'error',
      'portfolio-architecture/no-server-only-import-in-client': 'error',
      'portfolio-architecture/no-authoring-imports-in-public-render': [
        'error',
        {
          publicPrefixes: ['src/modules/portfolio-renderer/', 'src/app/(public)/'],
          forbidden: authoringOnlyDependencies,
        },
      ],
      'portfolio-architecture/no-unscoped-repository-access': [
        'error',
        {
          allowedPrefixes: [
            'src/modules/portfolios/repositories/',
            'src/modules/publishing/',
            'src/modules/seo/',
            'src/modules/admin-health/',
            'src/app/(public)/',
            'src/app/sitemap.ts',
          ],
        },
      ],
    },
  },
];
