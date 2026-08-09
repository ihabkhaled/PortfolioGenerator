import { describe, expect, it } from 'vitest';

import {
  migratePortfolioDocument,
  portfolioDocumentSchema,
  PORTFOLIO_SCHEMA_VERSION,
  tryMigratePortfolioDocument,
  deriveSocialLinks,
  isRecord,
  upgradeContact,
  upgradeDocumentToVersion2,
  upgradeIdentity,
  upgradePages,
  upgradeProjects,
  upgradeSkills,
  type PortfolioDocument,
} from '@/modules/portfolio-document';
import { parseSchema } from '@/packages/zod';

import { buildFullPortfolioDocument } from '../fixtures/portfolio-document.fixtures';

/**
 * The first real migration.
 *
 * Published portfolios written under version 1 have to keep rendering, and
 * every field version 2 added has to arrive at the value that means "the person
 * has not said" — never at a guess. A migration that invented a claim would put
 * words on someone's public page that they never wrote.
 */

/** A version 1 document, as that build actually wrote them. */
function buildVersion1Document(): Record<string, unknown> {
  return {
    schemaVersion: 1,
    identity: {
      displayName: 'Amina Rahman',
      headline: 'Backend engineer',
      summary: 'Payments and reliability.',
      location: 'Lisbon, Portugal',
      portraitAssetId: null,
      availabilityEnabled: true,
    },
    contact: {
      email: { value: 'amina@example.com', visible: true },
      phone: { value: '+351 000 000 000', visible: true },
    },
    links: [
      { id: 'l1', kind: 'code', label: 'Code', url: 'https://example.com/amina', visible: true },
      { id: 'l2', kind: 'writing', label: 'Writing', url: 'https://example.com/w', visible: false },
      { id: 'l3', kind: 'other', label: 'Other', url: 'https://example.com/o', visible: true },
    ],
    experience: [],
    projects: [
      {
        id: 'p1',
        name: 'Ledger Replay',
        summary: null,
        highlights: [],
        technologies: [],
        links: [],
      },
    ],
    skills: [{ id: 's1', label: 'Languages', items: ['TypeScript'] }],
    education: [],
    certifications: [],
    languages: [],
    awards: [],
    pages: [
      {
        id: 'page-home',
        slug: '',
        title: 'Home',
        navLabel: 'Home',
        visible: true,
        order: 0,
        sections: [
          {
            id: 'section-hero',
            type: 'hero',
            visible: true,
            order: 0,
            config: { showPortrait: false, showAvailability: true },
          },
        ],
      },
    ],
    theme: { templateId: 'reference-classic-v1', mode: 'system', accent: 'default' },
    seo: { title: null, description: null, indexable: true },
    source: { kind: 'manual', resumeUploadId: null },
  };
}

describe('upgradeDocumentToVersion2', () => {
  it('produces a document the current schema accepts', () => {
    const upgraded = upgradeDocumentToVersion2(buildVersion1Document());
    const result = parseSchema(portfolioDocumentSchema, upgraded);

    expect(result.ok).toBe(true);
  });

  it('stamps the new version', () => {
    const upgraded = upgradeDocumentToVersion2(buildVersion1Document()) as Record<string, unknown>;

    expect(upgraded['schemaVersion']).toBe(2);
    expect(PORTFOLIO_SCHEMA_VERSION).toBe(2);
  });

  // A migration that guessed would put words on a public page nobody wrote.
  it('leaves every new free-text field empty rather than inventing one', () => {
    const upgraded = migratePortfolioDocument(buildVersion1Document());

    expect(upgraded.identity.tagline).toBeNull();
    expect(upgraded.identity.availabilityNote).toBeNull();
    expect(upgraded.identity.coverLetter).toBeNull();
    expect(upgraded.softSkills).toEqual([]);
    expect(upgraded.courses).toEqual([]);
    expect(upgraded.publications).toEqual([]);
    expect(upgraded.volunteering).toEqual([]);
    expect(upgraded.testimonials).toEqual([]);
    expect(upgraded.interests).toEqual([]);
    expect(upgraded.gallery).toEqual([]);
    expect(upgraded.attachments).toEqual([]);
  });

  it('runs through the public migration entry point', () => {
    const upgraded = migratePortfolioDocument(buildVersion1Document());

    expect(upgraded.identity.displayName).toBe('Amina Rahman');
    expect(upgraded.schemaVersion).toBe(2);
  });

  // A row that is not an object at all is not a document; validation says so.
  it('passes a non-object through so validation produces the error', () => {
    expect(upgradeDocumentToVersion2('not a document')).toBe('not a document');
    expect(tryMigratePortfolioDocument('not a document')).toBeNull();
  });
});

describe('the phone number a version 1 document held', () => {
  it('moves the whole string into the national number', () => {
    const upgraded = migratePortfolioDocument(buildVersion1Document());

    expect(upgraded.contact.phone.nationalNumber).toBe('+351 000 000 000');
    expect(upgraded.contact.phone.visible).toBe(true);
  });

  // Several dialling prefixes cover more than one country. A wrong flag next to
  // a real person's number is worse than no flag.
  it('does not guess the country from the prefix', () => {
    const upgraded = migratePortfolioDocument(buildVersion1Document());

    expect(upgraded.contact.phone.countryIso).toBeNull();
  });

  it('tolerates a contact block with no phone at all', () => {
    expect(upgradeContact({ email: { value: null, visible: false } })).toEqual({
      email: { value: null, visible: false },
      phone: { countryIso: null, nationalNumber: null, visible: false },
    });
  });

  it('passes a contact block that is not an object through', () => {
    expect(upgradeContact(null)).toBeNull();
  });
});

describe('deriveSocialLinks', () => {
  it('promotes the links whose kind names a platform', () => {
    const social = deriveSocialLinks(buildVersion1Document()['links']) as Record<string, unknown>[];

    expect(social.map((link) => link['kind'])).toEqual(['github', 'medium']);
  });

  // Losing a link to gain a tidier shape would lose the person's content.
  it('leaves the original links collection untouched', () => {
    const upgraded = migratePortfolioDocument(buildVersion1Document());

    expect(upgraded.links).toHaveLength(3);
  });

  it('keeps the first of two links claiming the same platform', () => {
    const social = deriveSocialLinks([
      { id: 'a', kind: 'github', url: 'https://example.com/one', visible: true },
      { id: 'b', kind: 'code', url: 'https://example.com/two', visible: true },
    ]) as Record<string, unknown>[];

    expect(social).toHaveLength(1);
    expect(social[0]?.['url']).toBe('https://example.com/one');
  });

  it.each([
    ['not an array', 'links'],
    ['null', null],
  ])('returns nothing when links is %s', (_label, value) => {
    expect(deriveSocialLinks(value)).toEqual([]);
  });

  it('skips entries that are not link-shaped', () => {
    expect(deriveSocialLinks(['string', null, { id: 'x' }])).toEqual([]);
  });

  it('carries a custom label across', () => {
    const social = deriveSocialLinks([
      { id: 'a', kind: 'github', label: '@amina', url: 'https://example.com/a', visible: true },
    ]) as Record<string, unknown>[];

    expect(social[0]?.['label']).toBe('@amina');
  });
});

describe('the collections version 2 changed shape', () => {
  // `working` is the tier that says the least. Promoting to `primary` would be
  // the migration asserting expertise on the person's behalf.
  it('gives every existing skill group the most modest tier', () => {
    const upgraded = migratePortfolioDocument(buildVersion1Document());

    expect(upgraded.skills[0]?.tier).toBe('working');
  });

  it('gives projects no slug, because a project page is a decision', () => {
    const upgraded = migratePortfolioDocument(buildVersion1Document());

    expect(upgraded.projects[0]?.slug).toBeNull();
    expect(upgraded.projects[0]?.featured).toBe(false);
    expect(upgraded.projects[0]?.content).toEqual([]);
  });

  it('marks every existing page public, which is what it already was', () => {
    const upgraded = migratePortfolioDocument(buildVersion1Document());

    expect(upgraded.pages[0]?.visibility).toBe('public');
    expect(upgraded.pages[0]?.passwordHash).toBeNull();
  });

  it.each([
    ['identity', upgradeIdentity],
    ['projects', upgradeProjects],
    ['skills', upgradeSkills],
    ['pages', upgradePages],
  ])('passes a malformed %s collection through untouched', (_label, upgrade) => {
    expect(upgrade('nonsense')).toBe('nonsense');
  });

  it('leaves non-object entries inside a collection alone', () => {
    expect(upgradeProjects(['x'])).toEqual(['x']);
    expect(upgradeSkills(['x'])).toEqual(['x']);
    expect(upgradePages(['x'])).toEqual(['x']);
  });
});

describe('isRecord', () => {
  it.each([
    ['an object', {}, true],
    ['an array', [], false],
    ['null', null, false],
    ['a string', 'x', false],
  ])('reports %s as %s', (_label, value, expected) => {
    expect(isRecord(value)).toBe(expected);
  });
});

describe('a version 2 document', () => {
  it('is left alone by the chain, because no step starts from 2', () => {
    const current = buildFullPortfolioDocument();

    expect(migratePortfolioDocument(current)).toEqual(current);
  });
});

function withPages(pages: PortfolioDocument['pages']): unknown {
  return { ...buildFullPortfolioDocument(), pages };
}

describe('the invariants version 2 added', () => {
  // A private home page makes the whole portfolio unreachable, which is
  // "unpublish" wearing a costume.
  it('refuses a private home page', () => {
    const document = buildFullPortfolioDocument();
    const result = parseSchema(
      portfolioDocumentSchema,
      withPages(
        document.pages.map((page) =>
          page.slug === '' ? { ...page, visibility: 'private', passwordHash: 'x' } : page,
        ),
      ),
    );

    expect(result.ok).toBe(false);
  });

  // A private page with no password is a public page that believes otherwise.
  it('refuses a private page with no share password', () => {
    const document = buildFullPortfolioDocument();
    const result = parseSchema(
      portfolioDocumentSchema,
      withPages(
        document.pages.map((page) =>
          page.slug === 'projects' ? { ...page, visibility: 'private', passwordHash: null } : page,
        ),
      ),
    );

    expect(result.ok).toBe(false);
  });

  it('accepts a private page that has one', () => {
    const document = buildFullPortfolioDocument();
    const result = parseSchema(
      portfolioDocumentSchema,
      withPages(
        document.pages.map((page) =>
          page.slug === 'projects'
            ? { ...page, visibility: 'private', passwordHash: 'argon2id$hash' }
            : page,
        ),
      ),
    );

    expect(result.ok).toBe(true);
  });

  it('refuses two projects claiming the same slug', () => {
    const document = buildFullPortfolioDocument();
    const result = parseSchema(portfolioDocumentSchema, {
      ...document,
      projects: document.projects.map((project) => ({ ...project, slug: 'same' })),
    });

    expect(result.ok).toBe(false);
  });

  // A project page and a portfolio page would collide on the same URL segment.
  it('refuses a project slug that collides with a page', () => {
    const document = buildFullPortfolioDocument();
    const result = parseSchema(portfolioDocumentSchema, {
      ...document,
      projects: document.projects.map((project, index) =>
        index === 0 ? { ...project, slug: 'projects' } : project,
      ),
    });

    expect(result.ok).toBe(false);
  });

  it('refuses the same social platform twice', () => {
    const document = buildFullPortfolioDocument();
    const result = parseSchema(portfolioDocumentSchema, {
      ...document,
      socialLinks: document.socialLinks.map((link) => ({ ...link, kind: 'github' })),
    });

    expect(result.ok).toBe(false);
  });
});
