import { describe, expect, it } from 'vitest';

import type { PortfolioPage } from '@/modules/portfolio-document';
import { buildFullPortfolioDocument } from '@/tests/fixtures/portfolio-document.fixtures';

import {
  buildPortfolioPdfDownloadFilename,
  buildPortfolioPdfPageUrls,
  hasDownloadablePortfolioContent,
} from '../policies/portfolio-pdf-page-url.policy';

const PRIVATE_PAGE: PortfolioPage = {
  id: 'page-private',
  slug: 'private-notes',
  title: 'Private notes',
  navLabel: 'Private notes',
  description: null,
  visible: true,
  visibility: 'private',
  passwordHash: 'hash',
  order: 30,
  sections: [],
};

describe('buildPortfolioPdfPageUrls', () => {
  it('builds one URL per visible public page, in navigation order', () => {
    const document = buildFullPortfolioDocument();

    expect(buildPortfolioPdfPageUrls('https://example.com', 'amina', document)).toEqual([
      'https://example.com/portfolios/amina',
      'https://example.com/portfolios/amina/projects',
    ]);
  });

  it('excludes a page that is not visible, even if it is public', () => {
    const document = buildFullPortfolioDocument();
    // The fixture's "notes" page is public but `visible: false`.
    const urls = buildPortfolioPdfPageUrls('https://example.com', 'amina', document);

    expect(urls.some((url) => url.endsWith('/notes'))).toBe(false);
  });

  it('never includes a private page, however it is reached', () => {
    const document = buildFullPortfolioDocument();
    const withPrivatePage = { ...document, pages: [...document.pages, PRIVATE_PAGE] };
    const urls = buildPortfolioPdfPageUrls('https://example.com', 'amina', withPrivatePage);

    expect(urls.some((url) => url.includes('private-notes'))).toBe(false);
  });

  it('returns nothing for a portfolio with no public pages at all', () => {
    const document = buildFullPortfolioDocument();
    const allPrivate = {
      ...document,
      pages: document.pages.map((page) => ({ ...page, visibility: 'private' as const })),
    };

    expect(buildPortfolioPdfPageUrls('https://example.com', 'amina', allPrivate)).toEqual([]);
  });
});

describe('hasDownloadablePortfolioContent', () => {
  it('is true when at least one page is visible and public', () => {
    expect(hasDownloadablePortfolioContent(buildFullPortfolioDocument())).toBe(true);
  });

  it('is false when every page is private', () => {
    const document = buildFullPortfolioDocument();
    const allPrivate = {
      ...document,
      pages: document.pages.map((page) => ({ ...page, visibility: 'private' as const })),
    };

    expect(hasDownloadablePortfolioContent(allPrivate)).toBe(false);
  });

  it('is false when every public page is hidden', () => {
    const document = buildFullPortfolioDocument();
    const allHidden = {
      ...document,
      pages: document.pages.map((page) => ({ ...page, visible: false })),
    };

    expect(hasDownloadablePortfolioContent(allHidden)).toBe(false);
  });
});

describe('buildPortfolioPdfDownloadFilename', () => {
  it('names the file after the portfolio slug', () => {
    expect(buildPortfolioPdfDownloadFilename('amina-rahman')).toBe('amina-rahman.pdf');
  });
});
