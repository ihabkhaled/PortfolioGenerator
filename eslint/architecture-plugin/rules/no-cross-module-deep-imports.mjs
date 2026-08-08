/**
 * Rule: portfolio-architecture/no-cross-module-deep-imports
 *
 * A feature module is a black box. Other code may import it only through its
 * public surface `@/modules/<feature>` (the module index.ts). Deep imports
 * into another module's internals are forbidden. Inside the same module,
 * relative imports are the canonical style.
 */

import {
  getModuleName,
  getSourcePath,
  resolveImportToSourcePath,
  toPosixPath,
} from '../shared/source-utils.mjs';

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Modules may only be imported through their public surface '@/modules/<feature>'.",
    },
    schema: [
      {
        type: 'object',
        properties: {
          /**
           * Additional public surface files a module may expose beside
           * `index.ts`. This repo uses `server.ts` for surfaces guarded by
           * `server-only` and `dashboard.ts` for authoring UI, so a client
           * component importing a type never drags the database client into
           * its bundle. Anything not listed here is still internal.
           */
          surfaces: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      deepImport:
        "Deep import into module '{{module}}' internals is forbidden. Import from '@/modules/{{module}}' or one of its declared surfaces — the module decides what is public.",
    },
  },
  create(context) {
    const options = context.options[0] ?? {};
    const surfaces = options.surfaces ?? ['index'];
    const importerSource = getSourcePath(toPosixPath(context.filename));

    if (!importerSource) {
      return {};
    }

    const importerModule = getModuleName(importerSource);

    return {
      ImportDeclaration(node) {
        const resolved = resolveImportToSourcePath(String(node.source.value), context.filename);

        if (!resolved) {
          return;
        }

        const targetModule = getModuleName(`${resolved}/`);

        if (!targetModule || targetModule === importerModule) {
          return;
        }

        const moduleRoot = `src/modules/${targetModule}`;
        const allowed = [
          moduleRoot,
          `${moduleRoot}/`,
          ...surfaces.map((surface) => `${moduleRoot}/${surface}`),
        ];
        const isPublicSurface = allowed.includes(resolved);

        if (!isPublicSurface) {
          context.report({
            node,
            messageId: 'deepImport',
            data: { module: targetModule },
          });
        }
      },
    };
  },
};
