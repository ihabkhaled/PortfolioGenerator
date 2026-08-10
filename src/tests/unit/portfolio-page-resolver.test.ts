import { describe, expect, it } from 'vitest';

import {
  buildNavigation,
  buildPublicNavigation,
  buildPageHref,
  findVisiblePage,
  findPublicPage,
  resolvePageSlug,
  sortVisiblePages,
  sortVisibleSections,
} from '@/modules/portfolio-document';

import { buildFullPortfolioDocument } from '../fixtures/portfolio-document.fixtures';

/**
 * Route resolution sits directly on the network edge, so these tests are as
 * much about what does *not* resolve as what does. A hidden page must be
 * indistinguishable from a nonexistent one, or the router becomes a way to
 * enumerate unpublished work.
 */
describe('resolvePageSlug', () => {
  it('treats no segments as the home page', () => {
    expect(resolvePageSlug(undefined)).toBe('');
    expect(resolvePageSlug([])).toBe('');
  });

  it('reads a single segment as the page slug', () => {
    expect(resolvePageSlug(['projects'])).toBe('projects');
  });

  it('refuses nested paths rather than resolving the first segment', () => {
    expect(resolvePageSlug(['projects', 'extra'])).toBeNull();
    expect(resolvePageSlug(['..', 'admin'])).toBeNull();
  });
});

describe('findVisiblePage', () => {
  const document = buildFullPortfolioDocument();

  it('resolves the home page', () => {
    expect(findVisiblePage(document, '')?.page.id).toBe('page-home');
  });

  it('resolves a visible subpage', () => {
    expect(findVisiblePage(document, 'projects')?.page.id).toBe('page-projects');
  });

  it('returns null for a hidden page, exactly as for one that does not exist', () => {
    expect(findVisiblePage(document, 'notes')).toBeNull();
    expect(findVisiblePage(document, 'does-not-exist')).toBeNull();
  });

  it('matches slugs exactly, with no case folding or fuzzy fallback', () => {
    expect(findVisiblePage(document, 'Projects')).toBeNull();
    expect(findVisiblePage(document, ' projects')).toBeNull();
  });

  it('returns only the visible sections, in order', () => {
    const resolved = findVisiblePage(document, '');
    const orders = resolved?.sections.map((section) => section.order) ?? [];

    expect(orders).toEqual([...orders].toSorted((left, right) => left - right));
    expect(resolved?.sections.every((section) => section.visible)).toBe(true);
  });
});

describe('public page resolution', () => {
  const document = buildFullPortfolioDocument();
  const privateDocument = {
    ...document,
    pages: document.pages.map((page) =>
      page.slug === 'projects'
        ? { ...page, visibility: 'private' as const, passwordHash: 'argon2id$hash' }
        : page,
    ),
  };

  it('does not resolve a private page before a password challenge authorizes it', () => {
    expect(findPublicPage(privateDocument, 'projects')).toBeNull();
    expect(findVisiblePage(privateDocument, 'projects')?.page.id).toBe('page-projects');
  });

  it('returns a public page and treats a missing page as absent', () => {
    expect(findPublicPage(document, 'projects')?.page.id).toBe('page-projects');
    expect(findPublicPage(document, 'missing')).toBeNull();
  });

  it('does not advertise private pages in anonymous navigation', () => {
    expect(
      buildPublicNavigation(privateDocument, 'amina-rahman', '').map((item) => item.slug),
    ).toEqual(['']);
  });
});

describe('sortVisibleSections', () => {
  it('drops hidden sections and sorts the rest by order', () => {
    const sections = sortVisibleSections([
      { id: 'b', type: 'about', visible: true, order: 20, config: { title: null } },
      { id: 'a', type: 'skills', visible: true, order: 10, config: { title: null } },
      { id: 'c', type: 'languages', visible: false, order: 5, config: { title: null } },
    ]);

    expect(sections.map((section) => section.id)).toEqual(['a', 'b']);
  });
});

describe('sortVisiblePages', () => {
  it('excludes hidden pages from navigation', () => {
    const pages = sortVisiblePages(buildFullPortfolioDocument());

    expect(pages.map((page) => page.slug)).toEqual(['', 'projects']);
  });
});

describe('buildPageHref', () => {
  it('addresses the home page by the portfolio slug alone', () => {
    expect(buildPageHref('amina-rahman', '')).toBe('/portfolios/amina-rahman');
  });

  it('appends a subpage slug', () => {
    expect(buildPageHref('amina-rahman', 'projects')).toBe('/portfolios/amina-rahman/projects');
  });
});

describe('buildNavigation', () => {
  it('marks the current page and skips hidden ones', () => {
    const navigation = buildNavigation(buildFullPortfolioDocument(), 'amina-rahman', 'projects');

    expect(navigation).toEqual([
      {
        pageId: 'page-home',
        slug: '',
        label: 'Home',
        href: '/portfolios/amina-rahman',
        isCurrent: false,
        isHome: true,
      },
      {
        pageId: 'page-projects',
        slug: 'projects',
        label: 'Projects',
        href: '/portfolios/amina-rahman/projects',
        isCurrent: true,
        isHome: false,
      },
    ]);
  });
});
