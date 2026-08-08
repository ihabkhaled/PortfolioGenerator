import { describe, expect, it } from 'vitest';

import {
  migratePortfolioDocument,
  PORTFOLIO_SCHEMA_VERSION,
  readSchemaVersion,
  tryMigratePortfolioDocument,
  upgradeToCurrentVersion,
} from '@/modules/portfolio-document';

import { buildFullPortfolioDocument } from '../fixtures/portfolio-document.fixtures';

/**
 * Migration is the promise that a portfolio published today still renders after
 * the schema moves. The mechanism is tested now, while the chain is empty, so
 * that shipping version 2 is adding one step rather than designing this under
 * pressure with live portfolios failing.
 */
describe('readSchemaVersion', () => {
  it('reads a numeric version', () => {
    expect(readSchemaVersion({ schemaVersion: 1 })).toBe(1);
  });

  it.each([
    ['null', null],
    ['a string', 'document'],
    ['an array', []],
    ['an object without the key', { identity: {} }],
    ['a non-numeric version', { schemaVersion: 'one' }],
  ])('returns null for %s', (_description, input) => {
    expect(readSchemaVersion(input)).toBeNull();
  });
});

describe('upgradeToCurrentVersion', () => {
  it('passes a current document through unchanged', () => {
    const document = buildFullPortfolioDocument();

    expect(upgradeToCurrentVersion(document)).toEqual(document);
  });

  it('passes an unversioned value through so validation produces the error', () => {
    expect(upgradeToCurrentVersion({ nonsense: true })).toEqual({ nonsense: true });
  });

  it('passes a newer version through rather than guessing how to downgrade', () => {
    const future = { ...buildFullPortfolioDocument(), schemaVersion: PORTFOLIO_SCHEMA_VERSION + 1 };

    expect(upgradeToCurrentVersion(future)).toEqual(future);
  });
});

describe('migratePortfolioDocument', () => {
  it('returns a validated document', () => {
    expect(migratePortfolioDocument(buildFullPortfolioDocument()).identity.displayName).toBe(
      'Amina Rahman',
    );
  });

  it('throws with the offending paths, so a bad row is diagnosable', () => {
    expect(() => migratePortfolioDocument({ schemaVersion: 1 })).toThrow(
      /Invalid portfolio document/,
    );
  });
});

describe('tryMigratePortfolioDocument', () => {
  it('returns the document when it is valid', () => {
    expect(tryMigratePortfolioDocument(buildFullPortfolioDocument())).not.toBeNull();
  });

  it('returns null instead of throwing, so one corrupt row is a 404 and not a 500', () => {
    expect(tryMigratePortfolioDocument({ schemaVersion: 1 })).toBeNull();
    expect(tryMigratePortfolioDocument(null)).toBeNull();
    expect(tryMigratePortfolioDocument('not a document')).toBeNull();
  });
});
