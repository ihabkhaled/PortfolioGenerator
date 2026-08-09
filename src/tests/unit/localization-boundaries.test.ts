import { describe, expect, it } from 'vitest';

import {
  toTranslationSnapshot,
  translationActionSchema,
  type TranslationRow,
  versionedTranslationActionSchema,
} from '@/modules/localization';
import { parseSchema } from '@/packages/zod';

import { buildFullPortfolioDocument } from '../fixtures/portfolio-document.fixtures';

function translationRow(overrides: Partial<TranslationRow> = {}): TranslationRow {
  const document = buildFullPortfolioDocument();

  return {
    id: 'translation-1',
    portfolioId: 'portfolio-1',
    locale: 'fr',
    draftDocument: document,
    draftVersion: 2,
    reviewedDocument: document,
    reviewedAt: new Date('2026-08-09T12:00:00.000Z'),
    publishedDocument: document,
    publishedVersion: 1,
    publishedAt: new Date('2026-08-09T13:00:00.000Z'),
    ...overrides,
  };
}

describe('toTranslationSnapshot', () => {
  it('parses each stored document before returning a translated snapshot', () => {
    expect(toTranslationSnapshot(translationRow())).toMatchObject({
      locale: 'fr',
      draftVersion: 2,
    });
  });

  it.each([
    ['an invalid draft', { draftDocument: {} }],
    ['an unsupported locale', { locale: 'xx' }],
    ['the source locale', { locale: 'en' }],
    ['an invalid reviewed document', { reviewedDocument: {} }],
    ['an invalid published document', { publishedDocument: {} }],
  ] as const)('rejects %s', (_label, overrides) => {
    expect(toTranslationSnapshot(translationRow(overrides))).toBeNull();
  });

  it('preserves absent optional review and publication snapshots', () => {
    expect(
      toTranslationSnapshot(translationRow({ reviewedDocument: null, publishedDocument: null })),
    ).toMatchObject({ reviewedDocument: null, publishedDocument: null });
  });
});

describe('translation action schemas', () => {
  it('accepts a non-English locale and coerces a positive version', () => {
    expect(
      parseSchema(versionedTranslationActionSchema, {
        portfolioId: 'portfolio-1',
        locale: 'fr',
        expectedVersion: '2',
      }),
    ).toMatchObject({ ok: true, value: { locale: 'fr', expectedVersion: 2 } });
  });

  it.each([
    { portfolioId: '', locale: 'fr' },
    { portfolioId: 'portfolio-1', locale: 'en' },
    { portfolioId: 'portfolio-1', locale: 'unknown' },
  ])('rejects an invalid translation request', (input) => {
    expect(parseSchema(translationActionSchema, input).ok).toBe(false);
  });
});
