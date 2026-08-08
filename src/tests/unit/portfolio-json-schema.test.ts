import { describe, expect, it } from 'vitest';

import { portfolioDocumentSchema } from '@/modules/portfolio-document';
import { toJsonSchema } from '@/packages/zod';

/**
 * The published JSON Schema is generated from the Zod schema, never written by
 * hand, and checked in as a snapshot.
 *
 * Two schemas maintained in parallel diverge — usually silently, usually at the
 * moment an external consumer starts trusting the JSON one. Generating it makes
 * the Zod schema the single source of truth, and snapshotting it makes any
 * change to the public contract show up in a diff a reviewer has to approve.
 *
 * Regenerate deliberately with `npm run schema:json`.
 */
describe('portfolio JSON Schema', () => {
  it('matches the committed contract', async () => {
    const jsonSchema = toJsonSchema(portfolioDocumentSchema);

    await expect(`${JSON.stringify(jsonSchema, null, 2)}\n`).toMatchFileSnapshot(
      '../../../schemas/portfolio.schema.json',
    );
  });

  it('describes the document as an object with the canonical top-level fields', () => {
    const jsonSchema = toJsonSchema(portfolioDocumentSchema) as {
      properties?: Record<string, unknown>;
    };

    expect(Object.keys(jsonSchema.properties ?? {})).toEqual(
      expect.arrayContaining([
        'schemaVersion',
        'identity',
        'contact',
        'links',
        'experience',
        'projects',
        'skills',
        'education',
        'certifications',
        'languages',
        'awards',
        'pages',
        'theme',
        'seo',
        'source',
      ]),
    );
  });
});
