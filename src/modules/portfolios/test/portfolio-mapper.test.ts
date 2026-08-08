import { describe, expect, it } from 'vitest';

import { buildFullPortfolioDocument } from '@/tests/fixtures/portfolio-document.fixtures';
import { buildPortfolioRow } from '@/tests/fixtures/portfolio-row.fixtures';

import {
  readIdentity,
  toOwnedPortfolio,
  toPortfolioSummary,
  toPublishedPortfolio,
} from '../mappers/portfolio.mapper';

/**
 * The mapper is where stored bytes become trusted domain objects. The behaviour
 * that matters most is what it does with a row it cannot trust — a draft
 * written by an older build, or a snapshot someone edited in a database console.
 */
describe('toOwnedPortfolio', () => {
  it('maps a row to the dashboard shape', () => {
    const owned = toOwnedPortfolio(buildPortfolioRow());

    expect(owned.slug).toBe('amina-rahman');
    expect(owned.draftDocument.identity.displayName).toBe('Amina Rahman');
    expect(owned.hasPublishedVersion).toBe(true);
  });

  it('reports no published version when the snapshot column is null', () => {
    const owned = toOwnedPortfolio(
      buildPortfolioRow({ publishedDocument: null, publishedVersion: null, publishedAt: null }),
    );

    expect(owned.hasPublishedVersion).toBe(false);
  });
});

describe('toPublishedPortfolio', () => {
  it('maps a published row', () => {
    const published = toPublishedPortfolio(buildPortfolioRow());

    expect(published?.document.identity.displayName).toBe('Amina Rahman');
    expect(published?.publishedVersion).toBe(1);
  });

  it.each([
    ['no document', { publishedDocument: null }],
    ['no version', { publishedVersion: null }],
    ['no timestamp', { publishedAt: null }],
  ])('returns null when the snapshot has %s', (_description, overrides) => {
    expect(toPublishedPortfolio(buildPortfolioRow(overrides))).toBeNull();
  });

  it('returns null for an unparseable snapshot rather than throwing on the public path', () => {
    expect(
      toPublishedPortfolio(buildPortfolioRow({ publishedDocument: { broken: true } })),
    ).toBeNull();
  });
});

describe('toPortfolioSummary', () => {
  it('surfaces the identity a dashboard row needs', () => {
    const summary = toPortfolioSummary(buildPortfolioRow());

    expect(summary.displayName).toBe('Amina Rahman');
    expect(summary.status).toBe('PUBLISHED');
  });

  it('degrades to blanks rather than blanking the whole list', () => {
    const summary = toPortfolioSummary(buildPortfolioRow({ draftDocument: { broken: true } }));

    expect(summary.displayName).toBe('');
    expect(summary.headline).toBeNull();
    expect(summary.id).toBe('portfolio-1');
  });
});

describe('readIdentity', () => {
  it('returns the stored identity', () => {
    expect(readIdentity(buildFullPortfolioDocument()).location).toBe('Lisbon, Portugal');
  });

  it('returns an empty identity for an invalid draft', () => {
    expect(readIdentity(undefined)).toEqual({
      displayName: '',
      headline: null,
      summary: null,
      location: null,
      portraitAssetId: null,
      availabilityEnabled: false,
    });
  });
});
