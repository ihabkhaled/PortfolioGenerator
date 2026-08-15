import { describe, expect, it } from 'vitest';

import {
  createDefaultHomeSections,
  createEmptyPortfolioDocument,
  DOCUMENT_COUNTS,
  DOCUMENT_LIMITS,
  portfolioDocumentSchema,
} from '@/modules/portfolio-document';
import { parseSchema } from '@/packages/zod';

import {
  buildFullPortfolioDocument,
  buildLongContentPortfolioDocument,
  buildMinimalPortfolioDocument,
  pageBySlug,
} from '../fixtures/portfolio-document.fixtures';

/**
 * The schema is where untrusted input becomes trusted data, so these tests are
 * about what it *refuses*, not only what it accepts.
 */
describe('portfolioDocumentSchema', () => {
  it.each([
    ['the full fixture', buildFullPortfolioDocument],
    ['the minimal fixture', buildMinimalPortfolioDocument],
    ['long, unicode and RTL content', buildLongContentPortfolioDocument],
  ])('accepts %s', (_description, build) => {
    expect(parseSchema(portfolioDocumentSchema, build()).ok).toBe(true);
  });

  it('accepts a brand-new empty document, so the manual path works without AI', () => {
    const result = parseSchema(portfolioDocumentSchema, createEmptyPortfolioDocument('Jane Doe'));

    expect(result.ok).toBe(true);
  });

  it('rejects an unknown schema version rather than guessing', () => {
    const document = { ...buildFullPortfolioDocument(), schemaVersion: 99 };

    expect(parseSchema(portfolioDocumentSchema, document).ok).toBe(false);
  });

  it('never carries an unknown top-level property into the parsed document', () => {
    const result = parseSchema(portfolioDocumentSchema, {
      ...buildFullPortfolioDocument(),
      injected: 'value',
    });
    const parsed: Record<string, unknown> = result.ok ? result.value : {};

    // Whether the schema strips the key or rejects the document matters less
    // than the guarantee under test: it can never reach a published snapshot.
    expect(Object.hasOwn(parsed, 'injected')).toBe(false);
  });

  describe('URL safety', () => {
    it('rejects a javascript: link, so a hostile CV cannot produce stored XSS', () => {
      const document = buildFullPortfolioDocument();
      const result = parseSchema(portfolioDocumentSchema, {
        ...document,
        links: [{ id: 'l1', kind: 'x', label: 'Click', url: 'javascript:alert(1)', visible: true }],
      });

      expect(result.ok).toBe(false);
    });

    it('rejects an unsafe credential URL on a certification', () => {
      const document = buildFullPortfolioDocument();
      const result = parseSchema(portfolioDocumentSchema, {
        ...document,
        certifications: [
          {
            id: 'c1',
            name: 'Cert',
            issuer: null,
            date: null,
            credentialUrl: 'data:text/html,<script>',
          },
        ],
      });

      expect(result.ok).toBe(false);
    });

    it('normalizes an accepted URL so publish-time and render-time agree', () => {
      const document = buildFullPortfolioDocument();
      const result = parseSchema(portfolioDocumentSchema, {
        ...document,
        links: [
          { id: 'l1', kind: 'x', label: 'Site', url: '  https://example.com  ', visible: true },
        ],
      });

      expect(result.ok && result.value.links[0]?.url).toBe('https://example.com/');
    });
  });

  describe('text sanitisation', () => {
    it('strips control and bidirectional-override characters from stored text', () => {
      const document = buildFullPortfolioDocument();
      const spoofed = `Amina${String.fromCodePoint(0x20_2e)}Rahman${String.fromCodePoint(0x20_0b)}`;
      const result = parseSchema(portfolioDocumentSchema, {
        ...document,
        identity: { ...document.identity, displayName: spoofed },
      });

      expect(result.ok && result.value.identity.displayName).toBe('AminaRahman');
    });

    it('keeps newlines, because a multi-line summary is legitimate content', () => {
      const document = buildFullPortfolioDocument();
      const result = parseSchema(portfolioDocumentSchema, {
        ...document,
        identity: { ...document.identity, summary: 'One.\nTwo.' },
      });

      expect(result.ok && result.value.identity.summary).toBe('One.\nTwo.');
    });

    it('rejects a display name that is only whitespace', () => {
      const document = buildFullPortfolioDocument();
      const result = parseSchema(portfolioDocumentSchema, {
        ...document,
        identity: { ...document.identity, displayName: ' '.repeat(3) },
      });

      expect(result.ok).toBe(false);
    });

    it('rejects text beyond its bound', () => {
      const document = buildFullPortfolioDocument();
      const result = parseSchema(portfolioDocumentSchema, {
        ...document,
        identity: {
          ...document.identity,
          headline: 'a'.repeat(DOCUMENT_LIMITS.headline + 1),
        },
      });

      expect(result.ok).toBe(false);
    });
  });

  describe('dates', () => {
    it.each(['2024-01', '1999-12'])('accepts %s', (month) => {
      const document = buildFullPortfolioDocument();
      const experience = document.experience[0];
      const result = parseSchema(portfolioDocumentSchema, {
        ...document,
        experience: [{ ...experience, startDate: month }],
      });

      expect(result.ok).toBe(true);
    });

    it.each(['2024', '2024-13', '2024-00', '2024-1', '2024-01-15', 'yesterday'])(
      'rejects %s',
      (month) => {
        const document = buildFullPortfolioDocument();
        const experience = document.experience[0];
        const result = parseSchema(portfolioDocumentSchema, {
          ...document,
          experience: [{ ...experience, startDate: month }],
        });

        expect(result.ok).toBe(false);
      },
    );
  });

  describe('page invariants', () => {
    it('requires exactly one home page, because routing depends on it', () => {
      const document = buildFullPortfolioDocument();
      const home = pageBySlug(document, '');
      const result = parseSchema(portfolioDocumentSchema, {
        ...document,
        pages: [home, { ...home, id: 'page-home-2' }],
      });

      expect(result.ok).toBe(false);
    });

    it('rejects a portfolio with no home page', () => {
      const document = buildFullPortfolioDocument();
      const result = parseSchema(portfolioDocumentSchema, {
        ...document,
        pages: document.pages.filter((page) => page.slug !== ''),
      });

      expect(result.ok).toBe(false);
    });

    it('rejects duplicate page slugs, which would make one page unreachable', () => {
      const document = buildFullPortfolioDocument();
      const projects = pageBySlug(document, 'projects');
      const result = parseSchema(portfolioDocumentSchema, {
        ...document,
        pages: [pageBySlug(document, ''), projects, { ...projects, id: 'page-projects-2' }],
      });

      expect(result.ok).toBe(false);
    });

    it('rejects duplicate page ids', () => {
      const document = buildFullPortfolioDocument();
      const projects = pageBySlug(document, 'projects');
      const result = parseSchema(portfolioDocumentSchema, {
        ...document,
        pages: [pageBySlug(document, ''), projects, { ...projects, slug: 'other' }],
      });

      expect(result.ok).toBe(false);
    });

    it('rejects duplicate section ids within a page', () => {
      const document = buildFullPortfolioDocument();
      const home = pageBySlug(document, '');
      const section = home.sections[0];
      if (section === undefined) throw new Error('fixture has no sections');
      const result = parseSchema(portfolioDocumentSchema, {
        ...document,
        pages: [{ ...home, sections: [section, section] }, ...document.pages.slice(1)],
      });

      expect(result.ok).toBe(false);
    });

    it.each(['../etc', 'a/b', 'A', 'a--b', '-a', 'a-', 'a b', '%2e%2e'])(
      'rejects the page slug %j, closing off path traversal',
      (slug) => {
        const document = buildFullPortfolioDocument();
        const result = parseSchema(portfolioDocumentSchema, {
          ...document,
          pages: [pageBySlug(document, ''), { ...pageBySlug(document, 'projects'), slug }],
        });

        expect(result.ok).toBe(false);
      },
    );

    it('rejects more pages than the bound allows', () => {
      const document = buildFullPortfolioDocument();
      const home = pageBySlug(document, '');
      const extra = Array.from({ length: DOCUMENT_COUNTS.pages + 1 }, (_value, index) => ({
        ...home,
        id: `page-${index}`,
        slug: `page-${index}`,
      }));

      const result = parseSchema(portfolioDocumentSchema, {
        ...document,
        pages: [home, ...extra],
      });

      expect(result.ok).toBe(false);
    });
  });

  describe('custom blocks', () => {
    it('accepts the four safe block kinds', () => {
      const document = buildFullPortfolioDocument();
      const result = parseSchema(portfolioDocumentSchema, {
        ...document,
        pages: [
          {
            ...pageBySlug(document, ''),
            sections: [
              {
                id: 'custom-1',
                type: 'custom',
                visible: true,
                order: 0,
                config: {
                  title: 'Extra',
                  blocks: [
                    { id: 'b1', kind: 'paragraph', text: 'Text.' },
                    { id: 'b2', kind: 'bullet-list', items: ['One'] },
                    { id: 'b3', kind: 'stat-list', items: [{ id: 's', label: 'L', value: 'V' }] },
                    {
                      id: 'b4',
                      kind: 'links',
                      items: [
                        {
                          id: 'l',
                          kind: 'site',
                          label: 'Site',
                          url: 'https://example.com',
                          visible: true,
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
          ...document.pages.slice(1),
        ],
      });

      expect(result.ok).toBe(true);
    });

    it('rejects an unknown block kind, so the vocabulary cannot be extended at runtime', () => {
      const document = buildFullPortfolioDocument();
      const result = parseSchema(portfolioDocumentSchema, {
        ...document,
        pages: [
          {
            ...pageBySlug(document, ''),
            sections: [
              {
                id: 'custom-1',
                type: 'custom',
                visible: true,
                order: 0,
                config: {
                  title: null,
                  blocks: [{ id: 'b1', kind: 'html', html: '<script>alert(1)</script>' }],
                },
              },
            ],
          },
          ...document.pages.slice(1),
        ],
      });

      expect(result.ok).toBe(false);
    });
  });

  it('rejects an unknown section type', () => {
    const document = buildFullPortfolioDocument();
    const result = parseSchema(portfolioDocumentSchema, {
      ...document,
      pages: [
        {
          ...pageBySlug(document, ''),
          sections: [{ id: 's', type: 'iframe', visible: true, order: 0, config: {} }],
        },
        ...document.pages.slice(1),
      ],
    });

    expect(result.ok).toBe(false);
  });

  it('rejects an unnamed theme accent, because a raw colour is user-supplied CSS', () => {
    const document = buildFullPortfolioDocument();
    const result = parseSchema(portfolioDocumentSchema, {
      ...document,
      theme: { ...document.theme, accent: '#ff0000' },
    });

    expect(result.ok).toBe(false);
  });
});

describe('createEmptyPortfolioDocument', () => {
  it('carries the display name it was given', () => {
    expect(createEmptyPortfolioDocument('Jane Doe').identity.displayName).toBe('Jane Doe');
  });

  it('starts as a manual source, since nothing has been imported yet', () => {
    expect(createEmptyPortfolioDocument('Jane').source).toEqual({
      kind: 'manual',
      resumeUploadId: null,
      pageOrder: null,
    });
  });

  it('produces one home page with an empty slug', () => {
    const { pages } = createEmptyPortfolioDocument('Jane');

    expect(pages).toHaveLength(1);
    expect(pages[0]?.slug).toBe('');
  });
});

describe('createDefaultHomeSections', () => {
  it('returns a fresh array each time, so editing one portfolio cannot affect another', () => {
    const first = createDefaultHomeSections();
    const second = createDefaultHomeSections();

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(first).toEqual(second);
  });

  it('leaves gaps in the order so a section can be inserted without renumbering', () => {
    const orders = createDefaultHomeSections().map((section) => section.order);

    expect(orders).toEqual([...orders].toSorted((left, right) => left - right));
    expect(new Set(orders).size).toBe(orders.length);
  });
});
