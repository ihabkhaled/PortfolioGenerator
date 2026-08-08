/**
 * Rule: portfolio-architecture/no-authoring-imports-in-public-render
 *
 * The public portfolio render path is the cheapest, most-hit surface in the
 * product and the one that must keep working when every authoring dependency
 * is down. It may never reach the AI provider, the resume-ingestion pipeline,
 * the PDF text extractor, the editor, or the object storage adapter — neither
 * at runtime nor in the client bundle.
 *
 * This rule is the machine-enforced twin of the "AI is authoring-only" and
 * "public bundle excludes AI/PDF/editor code" invariants.
 */

import { getSourcePath, isTestFile, isUnderAny, toPosixPath } from '../shared/source-utils.mjs';

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Public portfolio render code must not import authoring-only modules or packages (AI, resume ingestion, PDF parsing, editor, storage).',
    },
    schema: [
      {
        type: 'object',
        properties: {
          publicPrefixes: { type: 'array', items: { type: 'string' } },
          forbidden: { type: 'array', items: { type: 'string' } },
          allowIn: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      authoringImport:
        "'{{specifier}}' is authoring-only and must never reach the public portfolio render path. A published portfolio has to render with the AI provider, the parser and object storage all unavailable.",
    },
  },
  create(context) {
    const options = context.options[0] ?? {};
    const publicPrefixes = options.publicPrefixes ?? [];
    const forbidden = options.forbidden ?? [];
    const allowIn = options.allowIn ?? [];
    const sourcePath = getSourcePath(toPosixPath(context.filename));

    if (
      !sourcePath ||
      isTestFile(sourcePath) ||
      !isUnderAny(sourcePath, publicPrefixes) ||
      isUnderAny(sourcePath, allowIn)
    ) {
      return {};
    }

    function check(node, rawSpecifier) {
      const specifier = String(rawSpecifier);
      const match = forbidden.find(
        (entry) => specifier === entry || specifier.startsWith(`${entry}/`),
      );

      if (match) {
        context.report({
          node,
          messageId: 'authoringImport',
          data: { specifier },
        });
      }
    }

    return {
      ImportDeclaration(node) {
        check(node, node.source.value);
      },
      ExportNamedDeclaration(node) {
        if (node.source) {
          check(node, node.source.value);
        }
      },
      ExportAllDeclaration(node) {
        check(node, node.source.value);
      },
      ImportExpression(node) {
        if (node.source.type === 'Literal') {
          check(node, node.source.value);
        }
      },
    };
  },
};
