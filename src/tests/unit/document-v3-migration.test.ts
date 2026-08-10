import { describe, expect, it } from 'vitest';

import {
  migratePortfolioDocument,
  PORTFOLIO_SCHEMA_VERSION,
  upgradeDocumentToVersion3,
} from '@/modules/portfolio-document';

import { buildFullPortfolioDocument } from '../fixtures/portfolio-document.fixtures';

/**
 * The second real migration.
 *
 * Every contact section this application ever wrote — by the empty-document
 * factory and by the CV-import mapper alike — carried `config.showPhone: false`
 * with no editor control that could ever change it. Fixing the default reaches
 * a portfolio created after the fix; it does nothing for one that already
 * exists. This is the step that reaches those.
 */

/** A version 2 document carrying the bug this migration fixes. */
function buildVersion2Document(): Record<string, unknown> {
  return {
    schemaVersion: 2,
    pages: [
      {
        id: 'page-home',
        slug: '',
        sections: [
          { id: 'section-hero', type: 'hero', config: { showPortrait: true } },
          {
            id: 'section-contact',
            type: 'contact',
            config: { title: null, showEmail: true, showPhone: false, showLinks: true },
          },
        ],
      },
    ],
  };
}

describe('upgradeDocumentToVersion3', () => {
  it('turns showPhone on for every contact section', () => {
    const upgraded = upgradeDocumentToVersion3(buildVersion2Document()) as Record<string, unknown>;
    const pages = upgraded['pages'] as Record<string, unknown>[];
    const sections = pages[0]?.['sections'] as Record<string, unknown>[] | undefined;
    const contact = sections?.find((section) => section['type'] === 'contact');

    expect((contact?.['config'] as Record<string, unknown>)['showPhone']).toBe(true);
  });

  it('leaves a non-contact section alone', () => {
    const upgraded = upgradeDocumentToVersion3(buildVersion2Document()) as Record<string, unknown>;
    const pages = upgraded['pages'] as Record<string, unknown>[];
    const sections = pages[0]?.['sections'] as Record<string, unknown>[] | undefined;
    const hero = sections?.find((section) => section['type'] === 'hero');

    expect(hero?.['config']).toEqual({ showPortrait: true });
  });

  it('stamps the new version', () => {
    const upgraded = upgradeDocumentToVersion3(buildVersion2Document()) as Record<string, unknown>;

    expect(upgraded['schemaVersion']).toBe(3);
  });

  it('passes a non-object through so validation produces the error', () => {
    expect(upgradeDocumentToVersion3('not a document')).toBe('not a document');
  });

  it('tolerates pages or sections that are not arrays', () => {
    expect(upgradeDocumentToVersion3({ schemaVersion: 2, pages: 'nonsense' })).toEqual({
      schemaVersion: 3,
      pages: 'nonsense',
    });
    expect(
      upgradeDocumentToVersion3({
        schemaVersion: 2,
        pages: [{ id: 'p', sections: 'nonsense' }],
      }),
    ).toEqual({ schemaVersion: 3, pages: [{ id: 'p', sections: 'nonsense' }] });
  });

  // The exact scenario the bug produced: a portfolio that already existed
  // before the fix, still carrying `showPhone: false` on every contact
  // section, reaches the current version with the switch turned on.
  it('reaches an already-existing portfolio through the public migration entry point', () => {
    const legacy = { ...buildFullPortfolioDocument(), schemaVersion: 2 };

    const upgraded = migratePortfolioDocument(legacy);
    const contact = upgraded.pages[0]?.sections.find((section) => section.type === 'contact');

    expect(upgraded.schemaVersion).toBe(PORTFOLIO_SCHEMA_VERSION);
    expect(contact && 'showPhone' in contact.config ? contact.config.showPhone : null).toBe(true);
  });
});
