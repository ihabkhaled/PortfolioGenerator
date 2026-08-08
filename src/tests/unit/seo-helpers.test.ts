import { describe, expect, it } from 'vitest';

import {
  buildDefaultDescription,
  buildDefaultTitle,
  buildPageUrl,
  buildPersonStructuredData,
  buildPortfolioMetadataValues,
  SEO_DESCRIPTION_MAX_LENGTH,
  serializeStructuredData,
  truncate,
} from '@/modules/seo';

import {
  buildFullPortfolioDocument,
  buildMinimalPortfolioDocument,
  pageBySlug,
} from '../fixtures/portfolio-document.fixtures';

describe('buildPageUrl', () => {
  it('addresses the home page by the portfolio slug alone', () => {
    expect(buildPageUrl('amina-rahman', '')).toBe('https://portfoliogenerate.test/amina-rahman');
  });

  it('appends a subpage slug', () => {
    expect(buildPageUrl('amina-rahman', 'projects')).toBe(
      'https://portfoliogenerate.test/amina-rahman/projects',
    );
  });
});

describe('buildDefaultTitle', () => {
  const document = buildFullPortfolioDocument();

  it('uses name and headline on the home page', () => {
    expect(buildDefaultTitle(document, pageBySlug(document, ''))).toBe(
      'Amina Rahman — Backend engineer, payments and reliability',
    );
  });

  it('leads with the page title on a subpage', () => {
    expect(buildDefaultTitle(document, pageBySlug(document, 'projects'))).toBe(
      'Projects · Amina Rahman',
    );
  });
});

describe('buildDefaultDescription', () => {
  it('prefers the reviewed summary', () => {
    expect(buildDefaultDescription(buildFullPortfolioDocument())).toContain(
      'Backend engineer working on payment systems',
    );
  });

  it('falls back to name and headline rather than a generic platform sentence', () => {
    const document = buildMinimalPortfolioDocument();

    expect(buildDefaultDescription(document)).toBe('Minimal Example — Available for work');
  });

  it('never exceeds the search-result budget', () => {
    const document = buildFullPortfolioDocument();
    const long = { ...document, identity: { ...document.identity, summary: 'x'.repeat(500) } };

    expect(buildDefaultDescription(long).length).toBeLessThanOrEqual(SEO_DESCRIPTION_MAX_LENGTH);
  });
});

describe('truncate', () => {
  it('leaves short text alone', () => {
    expect(truncate('short', 10)).toBe('short');
  });

  it('ellipsises longer text at the boundary', () => {
    expect(truncate('abcdefghij', 5)).toBe('abcd…');
  });
});

describe('buildPortfolioMetadataValues', () => {
  const document = buildFullPortfolioDocument();

  it('derives canonical, title and description from reviewed fields', () => {
    const values = buildPortfolioMetadataValues({
      document,
      page: pageBySlug(document, ''),
      portfolioSlug: 'amina-rahman',
    });

    expect(values.canonical).toBe('https://portfoliogenerate.test/amina-rahman');
    expect(values.title).toContain('Amina Rahman');
    expect(values.indexable).toBe(true);
  });

  it('prefers the user override when one is set', () => {
    const overridden = {
      ...document,
      seo: { title: 'Custom title', description: 'Custom description', indexable: true },
    };
    const values = buildPortfolioMetadataValues({
      document: overridden,
      page: pageBySlug(overridden, ''),
      portfolioSlug: 'amina-rahman',
    });

    expect(values.title).toBe('Custom title');
    expect(values.description).toBe('Custom description');
  });

  it('respects the user opting out of indexing', () => {
    const noIndex = { ...document, seo: { ...document.seo, indexable: false } };
    const values = buildPortfolioMetadataValues({
      document: noIndex,
      page: pageBySlug(noIndex, ''),
      portfolioSlug: 'amina-rahman',
    });

    expect(values.indexable).toBe(false);
  });

  it('refuses to index a hidden page even when the portfolio allows indexing', () => {
    const values = buildPortfolioMetadataValues({
      document,
      page: pageBySlug(document, 'notes'),
      portfolioSlug: 'amina-rahman',
    });

    expect(values.indexable).toBe(false);
  });
});

describe('buildPersonStructuredData', () => {
  it('emits only reviewed fields', () => {
    const data = buildPersonStructuredData(
      buildFullPortfolioDocument(),
      'https://portfoliogenerate.test/amina-rahman',
    );

    expect(data).toMatchObject({
      '@type': 'Person',
      name: 'Amina Rahman',
      jobTitle: 'Backend engineer, payments and reliability',
      address: { addressLocality: 'Lisbon, Portugal' },
    });
  });

  it('lists only visible links in sameAs', () => {
    const data = buildPersonStructuredData(buildFullPortfolioDocument(), 'https://example.test/a');

    expect(data.sameAs).toEqual(['https://example.com/amina']);
  });

  it('omits absent keys rather than emitting an invented claim', () => {
    const data = buildPersonStructuredData(
      buildMinimalPortfolioDocument(),
      'https://example.test/a',
    );

    expect(Object.hasOwn(data, 'description')).toBe(false);
    expect(Object.hasOwn(data, 'address')).toBe(false);
    expect(Object.hasOwn(data, 'sameAs')).toBe(false);
  });

  it('omits jobTitle when there is no headline yet', () => {
    const document = buildMinimalPortfolioDocument();
    const data = buildPersonStructuredData(
      { ...document, identity: { ...document.identity, headline: null } },
      'https://example.test/a',
    );

    expect(Object.hasOwn(data, 'jobTitle')).toBe(false);
  });
});

describe('serializeStructuredData', () => {
  it('escapes < so a closing script tag inside content cannot break out', () => {
    const document = buildFullPortfolioDocument();
    const hostile = {
      ...document,
      identity: { ...document.identity, displayName: 'A</script><script>alert(1)' },
    };
    const serialized = serializeStructuredData(
      buildPersonStructuredData(hostile, 'https://example.test/a'),
    );

    expect(serialized).not.toContain('</script>');
    expect(serialized).toContain(String.raw`\u003c`);
  });

  it('stays valid JSON after escaping', () => {
    const serialized = serializeStructuredData(
      buildPersonStructuredData(buildFullPortfolioDocument(), 'https://example.test/a'),
    );

    expect(() => JSON.parse(serialized) as unknown).not.toThrow();
  });
});
