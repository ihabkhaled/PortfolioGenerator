import { describe, expect, it } from 'vitest';

import { APP_LOCALES, localizePlatformPath } from '@/modules/localization';
import { portfolioDocumentSchema } from '@/modules/portfolio-document';
import {
  buildOgCardValues,
  buildPlatformSitemapEntries,
  buildPlatformMetadataAlternates,
  buildPortfolioSitemapEntries,
  OG_HEADLINE_MAX_LENGTH,
  OG_NAME_MAX_LENGTH,
  toSitemapPortfolio,
  type SitemapPortfolio,
} from '@/modules/seo';
import { parseSchema } from '@/packages/zod';
import { MARKETING_ROUTE_PATHS, ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import {
  buildFullPortfolioDocument,
  buildLongContentPortfolioDocument,
} from '../fixtures/portfolio-document.fixtures';

const PUBLISHED_AT = new Date('2026-02-01T09:00:00.000Z');

function published(overrides: Partial<SitemapPortfolio> = {}): SitemapPortfolio {
  return {
    ...toSitemapPortfolio('amina-rahman', buildFullPortfolioDocument(), PUBLISHED_AT),
    ...overrides,
  };
}

function urls(entries: readonly { url: string }[]): readonly string[] {
  return entries.map((entry) => entry.url);
}

describe('buildPlatformSitemapEntries', () => {
  it('lists the marketing and entry routes only', () => {
    const listed = urls(buildPlatformSitemapEntries(PUBLISHED_AT));
    const publicPlatformPaths = [
      ROUTE_PATHS.home,
      ROUTE_PATHS.signIn,
      ROUTE_PATHS.signUp,
      ...Object.values(MARKETING_ROUTE_PATHS),
    ];

    expect(listed).toHaveLength(APP_LOCALES.length * publicPlatformPaths.length);
    for (const locale of APP_LOCALES) {
      for (const path of publicPlatformPaths) {
        expect(listed).toContain(
          `https://portfoliogenerate.test${localizePlatformPath(path, locale)}`,
        );
      }
    }
  });

  it('never lists a route behind a session', () => {
    const listed = urls(buildPlatformSitemapEntries(PUBLISHED_AT)).join(' ');

    expect(listed).not.toContain('/dashboard');
  });
});

describe('buildPlatformMetadataAlternates', () => {
  it('uses English by default and exposes every supported language', () => {
    const alternates = buildPlatformMetadataAlternates('/sign-in');

    expect(alternates.canonical).toBe('https://portfoliogenerate.test/sign-in');
    expect(alternates.languages['x-default']).toBe(alternates.languages['en']);
    expect(Object.keys(alternates.languages)).toHaveLength(APP_LOCALES.length + 1);
  });

  it('uses the requested locale for the canonical URL', () => {
    expect(buildPlatformMetadataAlternates('/sign-in', 'fr').canonical).toBe(
      'https://portfoliogenerate.test/fr/sign-in',
    );
  });
});

describe('buildPortfolioSitemapEntries', () => {
  it('addresses the home page by the portfolio slug alone', () => {
    const [home] = buildPortfolioSitemapEntries([published()]);

    expect(home?.url).toBe('https://portfoliogenerate.test/portfolios/amina-rahman');
    expect(home?.lastModified).toEqual(PUBLISHED_AT);
  });

  it('lists visible subpages', () => {
    expect(urls(buildPortfolioSitemapEntries([published()]))).toContain(
      'https://portfoliogenerate.test/portfolios/amina-rahman/projects',
    );
  });

  // A hidden page 404s; submitting known-404s teaches a crawler the domain is broken.
  it('omits a hidden page', () => {
    expect(urls(buildPortfolioSitemapEntries([published()]))).not.toContain(
      'https://portfoliogenerate.test/portfolios/amina-rahman/notes',
    );
  });

  // Opting out has to mean opting out everywhere, not only in a meta tag.
  it('omits a portfolio whose author turned indexing off', () => {
    const document = buildFullPortfolioDocument();
    const portfolio = published({
      document: { ...document, seo: { ...document.seo, indexable: false } },
    });

    expect(buildPortfolioSitemapEntries([portfolio])).toEqual([]);
  });

  it('orders pages the way the portfolio does', () => {
    const document = buildFullPortfolioDocument();
    const reordered = published({
      document: {
        ...document,
        pages: document.pages.map((page) => ({ ...page, order: 100 - page.order })),
      },
    });

    expect(urls(buildPortfolioSitemapEntries([reordered]))).toEqual([
      'https://portfoliogenerate.test/portfolios/amina-rahman/projects',
      'https://portfoliogenerate.test/portfolios/amina-rahman',
    ]);
  });

  it('ranks the home page above its subpages', () => {
    const [home, subpage] = buildPortfolioSitemapEntries([published()]);

    expect(home?.priority).toBeGreaterThan(subpage?.priority ?? 1);
  });

  it('handles an empty set without producing an empty entry', () => {
    expect(buildPortfolioSitemapEntries([])).toEqual([]);
  });

  it('prefixes translated portfolio entries with their locale', () => {
    expect(buildPortfolioSitemapEntries([{ ...published(), locale: 'fr' }])[0]?.url).toBe(
      'https://portfoliogenerate.test/fr/portfolios/amina-rahman',
    );
  });
});

describe('buildOgCardValues', () => {
  it('shows the name, headline and address without the scheme', () => {
    expect(buildOgCardValues(buildFullPortfolioDocument(), 'amina-rahman')).toEqual({
      name: 'Amina Rahman',
      headline: 'Backend engineer, payments and reliability',
      url: 'portfoliogenerate.test/portfolios/amina-rahman',
    });
  });

  it('omits an absent headline rather than rendering an empty line', () => {
    const document = buildFullPortfolioDocument();
    const values = buildOgCardValues(
      { ...document, identity: { ...document.identity, headline: null } },
      'amina-rahman',
    );

    expect(values.headline).toBeNull();
  });

  it('treats a whitespace headline as absent', () => {
    const document = buildFullPortfolioDocument();
    const values = buildOgCardValues(
      { ...document, identity: { ...document.identity, headline: ' '.repeat(3) } },
      'amina-rahman',
    );

    expect(values.headline).toBeNull();
  });

  // satori does not reflow past the canvas; an unbounded string renders off the edge.
  it('bounds long content to what the card can hold', () => {
    const values = buildOgCardValues(buildLongContentPortfolioDocument(), 'amina-rahman');

    expect(values.name.length).toBeLessThanOrEqual(OG_NAME_MAX_LENGTH);
    expect(values.headline?.length ?? 0).toBeLessThanOrEqual(OG_HEADLINE_MAX_LENGTH);
  });
});

describe('reserved page slugs', () => {
  // `/{slug}/opengraph-image` is served by the platform; a page there would 404.
  it('refuses a page slug that a platform handler already serves', () => {
    const document = buildFullPortfolioDocument();
    const result = parseSchema(portfolioDocumentSchema, {
      ...document,
      pages: document.pages.map((page) =>
        page.slug === 'projects' ? { ...page, slug: 'opengraph-image' } : page,
      ),
    });

    expect(result.ok).toBe(false);
  });

  it('still accepts an ordinary page slug', () => {
    const result = parseSchema(portfolioDocumentSchema, buildFullPortfolioDocument());

    expect(result.ok).toBe(true);
  });
});
