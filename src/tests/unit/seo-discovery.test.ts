import { render } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import {
  AdSenseScript,
  buildPortfolioFeedItems,
  escapeXml,
  serializeRssFeed,
  type SitemapPortfolio,
} from '@/modules/seo';
import { ADSENSE_SCRIPT_URL } from '@/shared/constants/advertising.constants';

import { buildFullPortfolioDocument } from '../fixtures/portfolio-document.fixtures';

const PUBLISHED_AT = new Date('2026-08-09T10:30:00.000Z');

function published(overrides: Partial<SitemapPortfolio> = {}): SitemapPortfolio {
  return {
    slug: 'amina-rahman',
    document: buildFullPortfolioDocument(),
    publishedAt: PUBLISHED_AT,
    ...overrides,
  };
}

describe('buildPortfolioFeedItems', () => {
  it('lists each visible page from an indexable published snapshot', () => {
    expect(buildPortfolioFeedItems([published()])).toEqual([
      {
        title: 'Home — Amina Rahman',
        url: 'https://portfoliogenerate.test/portfolios/amina-rahman',
        description:
          'Backend engineer working on payment systems.\nI care about the boring parts: idempotency, reconciliation, and error budgets that someone actually reads.',
        publishedAt: PUBLISHED_AT,
      },
      {
        title: 'Projects — Amina Rahman',
        url: 'https://portfoliogenerate.test/portfolios/amina-rahman/projects',
        description:
          'Backend engineer working on payment systems.\nI care about the boring parts: idempotency, reconciliation, and error budgets that someone actually reads.',
        publishedAt: PUBLISHED_AT,
      },
    ]);
  });

  it('never exposes hidden pages or a portfolio whose author disabled indexing', () => {
    const document = buildFullPortfolioDocument();
    const privateDocument = { ...document, seo: { ...document.seo, indexable: false } };

    const publicUrls = buildPortfolioFeedItems([published()]).map((item) => item.url);

    expect(publicUrls).not.toContain(
      'https://portfoliogenerate.test/portfolios/amina-rahman/notes',
    );
    expect(buildPortfolioFeedItems([published({ document: privateDocument })])).toEqual([]);
  });
});

describe('serializeRssFeed', () => {
  it('escapes every character with meaning in XML', () => {
    expect(escapeXml(`<&>"'`)).toBe('&lt;&amp;&gt;&quot;&apos;');
  });

  it('emits bounded XML with escaped reviewed content', () => {
    const xml = serializeRssFeed([
      {
        title: 'Research & Development <Lead>',
        url: 'https://portfoliogenerate.test/amina?a=1&b=2',
        description: 'Designing <safe> systems',
        publishedAt: PUBLISHED_AT,
      },
    ]);

    expect(xml).toContain('<rss version="2.0">');
    expect(xml).toContain('Research &amp; Development &lt;Lead&gt;');
    expect(xml).toContain('https://portfoliogenerate.test/amina?a=1&amp;b=2');
    expect(xml).not.toContain('<safe>');
  });

  it('limits the feed before an unbounded database result can enlarge the response', () => {
    const items = Array.from({ length: 101 }, (_, index) => ({
      title: `Portfolio ${index}`,
      url: `https://portfoliogenerate.test/person-${index}`,
      description: 'Reviewed description',
      publishedAt: PUBLISHED_AT,
    }));
    const xml = serializeRssFeed(items);

    expect(xml.match(/<item>/g)).toHaveLength(100);
    expect(xml).not.toContain('person-100');
  });
});

describe('AdSenseScript', () => {
  it('loads the official script once, after hydration, with the request nonce', () => {
    render(createElement(AdSenseScript, { nonce: 'request-nonce' }));
    const scripts = [...document.scripts].filter((script) => script.src === ADSENSE_SCRIPT_URL);

    // `next/script`'s `afterInteractive` strategy is what makes this load
    // after hydration rather than racing the theme script for a position in
    // <head> — see adsense-script.component.tsx. It manages the loading
    // timing itself instead of relying on the native `async` attribute, so
    // that attribute is deliberately not asserted here.
    expect(scripts).toHaveLength(1);
    expect(scripts[0]).toHaveAttribute('crossorigin', 'anonymous');
    expect(scripts[0]).toHaveAttribute('nonce', 'request-nonce');
    expect(scripts[0]).not.toHaveAttribute('data-nscript');
  });
});
