import { describe, expect, it } from 'vitest';

import { buildSiteFooterLinks } from '@/shared/utils/site-footer-links.util';

/**
 * A stand-in translator that returns the key itself, so an assertion reads as
 * "this column asked the catalog for these keys" without depending on the
 * English catalog's current copy.
 */
const translate = (key: string): string => key;

describe('buildSiteFooterLinks', () => {
  const columns = buildSiteFooterLinks(translate);

  it('groups the footer into product, company, legal and resources columns', () => {
    expect(columns.map((column) => column.id)).toEqual([
      'product',
      'company',
      'legal',
      'resources',
    ]);
  });

  it('labels every column heading from the catalog', () => {
    for (const column of columns) {
      expect(column.heading).toBe(`footer.columns.${column.id}`);
    }
  });

  it('labels every link from the catalog rather than hardcoding copy', () => {
    for (const column of columns) {
      for (const link of column.links) {
        expect(link.label.startsWith('footer.links.')).toBe(true);
      }
    }
  });

  it('explicitly includes the RSS feed and the sitemap', () => {
    const resources = columns.find((column) => column.id === 'resources');

    expect(resources?.links.map((link) => link.href)).toEqual(
      expect.arrayContaining(['/feed.xml', '/sitemap.xml']),
    );
  });

  it('only links to real routes this app serves, never to an invented page', () => {
    const hrefs = columns.flatMap((column) => column.links.map((link) => link.href));

    for (const href of hrefs) {
      expect(href.startsWith('/guides/') || href === '/feed.xml' || href === '/sitemap.xml').toBe(
        true,
      );
    }
  });

  it('never repeats the same link id across columns', () => {
    const ids = columns.flatMap((column) => column.links.map((link) => link.id));

    expect(new Set(ids).size).toBe(ids.length);
  });
});
