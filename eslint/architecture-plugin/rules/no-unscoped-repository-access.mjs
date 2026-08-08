/**
 * Rule: portfolio-architecture/no-unscoped-repository-access
 *
 * Tenant isolation fails the same way every time: code loads a row by id, then
 * checks ownership somewhere later — or forgets. The repository therefore
 * exposes owner-scoped finders by default and marks the few genuinely
 * tenant-free lookups (public slug resolution, platform health) with an
 * `Unscoped` suffix.
 *
 * Any reference to an `*Unscoped` identifier outside the explicitly allowed
 * prefixes is an unreviewed cross-tenant read. Move the call behind an
 * owner-scoped repository method instead.
 */

import { getSourcePath, isTestFile, isUnderAny, toPosixPath } from '../shared/source-utils.mjs';

const UNSCOPED_SUFFIX = /Unscoped$/;

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Unscoped (tenant-free) repository accessors may only be used from the allowed public-read and repository-internal paths.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedPrefixes: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unscoped:
        "'{{name}}' is a tenant-free lookup. Dashboard and authoring code must use an owner-scoped repository method such as getOwnedPortfolio(ownerId, id).",
    },
  },
  create(context) {
    const options = context.options[0] ?? {};
    const allowedPrefixes = options.allowedPrefixes ?? [];
    const sourcePath = getSourcePath(toPosixPath(context.filename));

    if (!sourcePath || isTestFile(sourcePath) || isUnderAny(sourcePath, allowedPrefixes)) {
      return {};
    }

    return {
      Identifier(node) {
        if (!UNSCOPED_SUFFIX.test(node.name)) {
          return;
        }

        // Property keys in object literals are declarations, not accesses; the
        // repository implementation itself lives under an allowed prefix.
        if (node.parent?.type === 'Property' && node.parent.key === node && !node.parent.computed) {
          return;
        }

        context.report({ node, messageId: 'unscoped', data: { name: node.name } });
      },
    };
  },
};
