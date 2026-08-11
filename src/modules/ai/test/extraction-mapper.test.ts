import { describe, expect, it } from 'vitest';

import {
  createEmptyPortfolioDocument,
  portfolioDocumentSchema,
} from '@/modules/portfolio-document';
import { parseSchema } from '@/packages/zod';
import { buildFullPortfolioDocument } from '@/tests/fixtures/portfolio-document.fixtures';

import { WARNING_CODES } from '../constants/extraction.constants';
import {
  buildImportedPages,
  createImportedSection,
  hasSectionContent,
  mapExtractionToDocument,
  normalizeMonth,
} from '../mappers/extraction-to-document.mapper';
import type { ResumeExtractionResult } from '../types/ai-provider.types';

/**
 * The mapper is where untrusted model output becomes a draft. Its contract is
 * "drop, do not guess", and every test here is a way a model gets things wrong.
 */

function extraction(overrides: Partial<ResumeExtractionResult> = {}): ResumeExtractionResult {
  return {
    identity: {
      displayName: 'Amina Rahman',
      headline: 'Engineer',
      summary: null,
      location: null,
      nationality: null,
      militaryStatus: null,
    },
    contact: { email: null, phone: null },
    links: [],
    experience: [],
    projects: [],
    skills: [],
    softSkills: [],
    education: [],
    courses: [],
    certifications: [],
    languages: [],
    awards: [],
    publications: [],
    volunteering: [],
    interests: [],
    warnings: [],
    ...overrides,
  };
}

describe('normalizeMonth', () => {
  it.each(['2024-01', '1999-12'])('keeps the valid month %s', (month) => {
    expect(normalizeMonth(month)).toBe(month);
  });

  it.each(['2024', 'January 2024', '2024-13', '2024-1', 'soon', ''])(
    'drops the unusable value %j rather than inventing a date',
    (month) => {
      expect(normalizeMonth(month)).toBeNull();
    },
  );

  it('passes an absent date through', () => {
    expect(normalizeMonth(null)).toBeNull();
  });
});

describe('imported section composition', () => {
  it.each([
    'about',
    'experience',
    'projects',
    'skills',
    'soft-skills',
    'education',
    'courses',
    'certifications',
    'languages',
    'publications',
    'volunteering',
    'awards',
    'interests',
    'testimonials',
    'gallery',
    'attachments',
    'social',
  ] as const)('detects populated and empty %s content', (type) => {
    const full = buildFullPortfolioDocument();
    const populated =
      type === 'awards'
        ? {
            ...full,
            awards: [
              {
                id: 'award-1',
                name: 'Reliability Award',
                issuer: null,
                date: null,
                description: null,
              },
            ],
          }
        : full;
    expect(hasSectionContent(populated, type)).toBe(true);
    expect(hasSectionContent(createEmptyPortfolioDocument('Amina'), type)).toBe(false);
  });

  it('covers contact visibility alternatives without treating hidden data as content', () => {
    const empty = createEmptyPortfolioDocument('Amina');
    expect(hasSectionContent(empty, 'contact')).toBe(false);
    expect(
      hasSectionContent(
        {
          ...empty,
          contact: { ...empty.contact, email: { value: 'a@example.com', visible: true } },
        },
        'contact',
      ),
    ).toBe(true);
    expect(
      hasSectionContent(
        {
          ...empty,
          contact: {
            email: { value: null, visible: false },
            phone: { countryIso: null, nationalNumber: '123', visible: true },
          },
        },
        'contact',
      ),
    ).toBe(true);
    expect(
      hasSectionContent(
        {
          ...empty,
          links: [
            {
              id: 'link-1',
              kind: 'website',
              label: 'Website',
              url: 'https://example.com',
              visible: true,
            },
          ],
        },
        'contact',
      ),
    ).toBe(true);
  });

  it('defines the always-present hero and never-inferred custom section decisions', () => {
    const empty = createEmptyPortfolioDocument('Amina');
    expect(hasSectionContent(empty, 'hero')).toBe(true);
    expect(hasSectionContent(empty, 'custom')).toBe(false);
    expect(createImportedSection('hero', 'home', 0)).toMatchObject({
      type: 'hero',
      config: { showPortrait: true, showAvailability: false },
    });
    expect(createImportedSection('custom', 'custom', 1)).toMatchObject({
      type: 'custom',
      order: 10,
      config: { title: null, blocks: [] },
    });
  });
});

function role(
  overrides: Partial<ResumeExtractionResult['experience'][number]> = {},
): ResumeExtractionResult['experience'][number] {
  return {
    organization: 'Northwind',
    title: 'Engineer',
    location: null,
    startDate: null,
    endDate: null,
    current: false,
    summary: null,
    highlights: [],
    technologies: [],
    ...overrides,
  };
}

describe('mapExtractionToDocument', () => {
  it('preserves explicitly extracted nationality and military status exactly', () => {
    const source = extraction();
    source.identity.nationality = 'Egyptian';
    source.identity.militaryStatus = 'Completed';

    const result = mapExtractionToDocument(source, 'Fallback', 'upload-1');

    expect(result.document.identity.nationality).toBe('Egyptian');
    expect(result.document.identity.militaryStatus).toBe('Completed');
  });
  it('produces a document the canonical schema accepts', () => {
    const result = mapExtractionToDocument(extraction(), 'Fallback Name', 'upload-1');

    expect(parseSchema(portfolioDocumentSchema, result.document).ok).toBe(true);
  });

  it('records the upload it came from', () => {
    const result = mapExtractionToDocument(extraction(), 'Fallback', 'upload-42');

    expect(result.document.source).toEqual({ kind: 'resume-import', resumeUploadId: 'upload-42' });
  });

  it('composes factual reference pages for the populated CV sections', () => {
    const result = mapExtractionToDocument(
      extraction({
        identity: {
          displayName: 'Amina Rahman',
          headline: 'Engineer',
          summary: 'Backend engineer.',
          location: null,
          nationality: null,
          militaryStatus: null,
        },
        experience: [role()],
        projects: [{ name: 'Ledger', summary: null, highlights: [], technologies: [], url: null }],
        skills: ['TypeScript'],
        education: [
          {
            institution: 'Example University',
            degree: null,
            field: null,
            startDate: null,
            endDate: null,
            location: null,
            details: null,
          },
        ],
      }),
      'Fallback',
      'upload-1',
    );

    expect(result.document.pages.map((page) => page.slug)).toEqual([
      '',
      'experience',
      'projects',
      'skills',
      'about',
    ]);
  });

  it('creates no imported pages when the document has no home page', () => {
    const result = mapExtractionToDocument(extraction(), 'Fallback', 'upload-1');

    expect(buildImportedPages({ ...result.document, pages: [] })).toEqual([]);
  });

  it('falls back to the account name when the model found no name', () => {
    const result = mapExtractionToDocument(
      extraction({
        identity: {
          displayName: null,
          headline: null,
          summary: null,
          location: null,
          nationality: null,
          militaryStatus: null,
        },
      }),
      'Fallback Name',
      'upload-1',
    );

    expect(result.document.identity.displayName).toBe('Fallback Name');
  });

  describe('links', () => {
    it('drops an unsafe URL and says so', () => {
      const result = mapExtractionToDocument(
        extraction({ links: [{ kind: 'code', url: 'javascript:alert(1)' }] }),
        'Fallback',
        'upload-1',
      );

      expect(result.document.links).toHaveLength(0);
      expect(result.warnings.map((warning) => warning.code)).toContain(
        WARNING_CODES.droppedInvalidUrl,
      );
    });

    it('keeps a safe URL and gives it a readable label', () => {
      const result = mapExtractionToDocument(
        extraction({ links: [{ kind: 'github', url: 'https://example.com/a' }] }),
        'Fallback',
        'upload-1',
      );

      expect(result.document.socialLinks[0]).toMatchObject({ kind: 'github', visible: true });
      expect(result.document.links).toHaveLength(0);
    });

    it('drops an unsafe social URL and reports its source position', () => {
      const result = mapExtractionToDocument(
        extraction({ links: [{ kind: 'github', url: 'javascript:alert(1)' }] }),
        'Fallback',
        'upload-1',
      );

      expect(result.document.socialLinks).toHaveLength(0);
      expect(result.warnings).toContainEqual({
        code: WARNING_CODES.droppedInvalidUrl,
        path: 'links.0',
        message: 'A social link was removed because it was not a safe https address.',
      });
    });

    it.each(['mastodon', 'bluesky'] as const)('maps %s as a bounded social platform', (kind) => {
      const result = mapExtractionToDocument(
        extraction({ links: [{ kind, url: 'https://example.com/a' }] }),
        'Fallback',
        'upload-1',
      );

      expect(result.document.socialLinks[0]?.kind).toBe(kind);
      expect(result.document.links).toEqual([]);
    });

    it.each(['LinkedIn', 'GitHub', ' GITHUB '])(
      'recognizes a social kind regardless of the case the model returned it in (%s)',
      (kind) => {
        const result = mapExtractionToDocument(
          extraction({ links: [{ kind, url: 'https://example.com/a' }] }),
          'Fallback',
          'upload-1',
        );

        expect(result.document.socialLinks).toHaveLength(1);
        expect(result.document.socialLinks[0]?.kind).toBe(kind.trim().toLowerCase());
        expect(result.document.links).toEqual([]);
      },
    );
  });

  describe('experience', () => {
    it('drops a role with neither an employer nor a title', () => {
      const result = mapExtractionToDocument(
        extraction({ experience: [role({ organization: null, title: null })] }),
        'Fallback',
        'upload-1',
      );

      expect(result.document.experience).toHaveLength(0);
      expect(result.warnings.map((warning) => warning.code)).toContain(
        WARNING_CODES.droppedIncompleteEntry,
      );
    });

    it('keeps a role that has only one of the two, rather than losing the fact', () => {
      const result = mapExtractionToDocument(
        extraction({ experience: [role({ title: null })] }),
        'Fallback',
        'upload-1',
      );

      expect(result.document.experience[0]).toMatchObject({
        organization: 'Northwind',
        title: 'Northwind',
      });
    });

    it('empties an unreadable end date and warns about it', () => {
      const result = mapExtractionToDocument(
        extraction({ experience: [role({ endDate: 'sometime in 2023' })] }),
        'Fallback',
        'upload-1',
      );

      expect(result.document.experience[0]?.endDate).toBeNull();
      expect(result.warnings.map((warning) => warning.code)).toContain(WARNING_CODES.ambiguousDate);
    });

    it('preserves a current role', () => {
      const result = mapExtractionToDocument(
        extraction({ experience: [role({ current: true, startDate: '2023-03' })] }),
        'Fallback',
        'upload-1',
      );

      expect(result.document.experience[0]).toMatchObject({
        current: true,
        startDate: '2023-03',
        endDate: null,
      });
    });
  });

  describe('projects', () => {
    it('drops a nameless project', () => {
      const result = mapExtractionToDocument(
        extraction({
          projects: [{ name: null, summary: 'x', highlights: [], technologies: [], url: null }],
        }),
        'Fallback',
        'upload-1',
      );

      expect(result.document.projects).toHaveLength(0);
    });

    it('drops an unsafe project URL but keeps the project', () => {
      const result = mapExtractionToDocument(
        extraction({
          projects: [
            {
              name: 'Ledger',
              summary: null,
              highlights: [],
              technologies: [],
              url: 'data:text/html,<script>',
            },
          ],
        }),
        'Fallback',
        'upload-1',
      );

      expect(result.document.projects[0]?.name).toBe('Ledger');
      expect(result.document.projects[0]?.links).toHaveLength(0);
    });
  });

  describe('skills', () => {
    it('deduplicates and trims into one group the user can split later', () => {
      const result = mapExtractionToDocument(
        extraction({ skills: ['TypeScript', ' TypeScript ', 'Go', '  '] }),
        'Fallback',
        'upload-1',
      );

      expect(result.document.skills).toHaveLength(1);
      expect(result.document.skills[0]?.items).toEqual(['TypeScript', 'Go']);
    });

    it('produces no group at all when there are no skills', () => {
      expect(mapExtractionToDocument(extraction(), 'Fallback', 'upload-1').document.skills).toEqual(
        [],
      );
    });
  });

  it('maps evidence-backed soft skills and courses without inventing missing details', () => {
    const result = mapExtractionToDocument(
      extraction({
        softSkills: [{ label: 'Mentoring', detail: 'Mentored three junior engineers.' }],
        courses: [
          {
            name: 'Distributed Systems',
            provider: 'Example Academy',
            date: null,
            url: null,
            summary: null,
          },
        ],
      }),
      'Fallback',
      'upload-1',
    );

    expect(result.document.softSkills[0]).toMatchObject({
      label: 'Mentoring',
      detail: 'Mentored three junior engineers.',
    });
    expect(result.document.courses[0]).toMatchObject({
      name: 'Distributed Systems',
      provider: 'Example Academy',
      date: null,
    });
  });

  it('maps only explicit publications, volunteering, and interests and marks them for review', () => {
    const result = mapExtractionToDocument(
      extraction({
        publications: [
          {
            title: 'Reliable Ledgers',
            publisher: 'Systems Journal',
            date: '2024-03',
            url: 'https://example.com/paper',
            summary: null,
          },
        ],
        volunteering: [
          {
            organization: 'Code Club',
            role: 'Mentor',
            startDate: null,
            endDate: null,
            summary: 'Mentored students.',
          },
        ],
        interests: ['Distributed systems', ' Typography ', ''],
      }),
      'Fallback',
      'upload-1',
    );

    expect(result.document.publications[0]).toMatchObject({ title: 'Reliable Ledgers' });
    expect(result.document.volunteering[0]).toMatchObject({ organization: 'Code Club' });
    expect(result.document.interests).toEqual(['Distributed systems', 'Typography']);
    expect(result.warnings.map((warning) => warning.path)).toEqual(
      expect.arrayContaining(['publications.0', 'volunteering.0', 'interests.0']),
    );
  });

  it('drops supplemental entries without required evidence and rejects unsafe publication URLs', () => {
    const result = mapExtractionToDocument(
      extraction({
        publications: [
          { title: null, publisher: null, date: null, url: null, summary: null },
          {
            title: 'Unsafe link',
            publisher: null,
            date: null,
            url: 'http://example.com',
            summary: null,
          },
        ],
        volunteering: [
          { organization: null, role: 'Mentor', startDate: null, endDate: null, summary: null },
        ],
        interests: [' ', 'Typography', 'Typography'],
      }),
      'Fallback',
      'upload-1',
    );

    expect(result.document.publications).toEqual([
      expect.objectContaining({ title: 'Unsafe link', url: null }),
    ]);
    expect(result.document.volunteering).toEqual([]);
    expect(result.document.interests).toEqual(['Typography']);
  });

  it('composes every populated canonical collection into at most twelve pages', () => {
    const result = mapExtractionToDocument(
      extraction({
        softSkills: [{ label: 'Mentoring', detail: 'Mentored two engineers.' }],
        courses: [{ name: 'Security', provider: null, date: null, url: null, summary: null }],
        languages: [{ name: 'Arabic', proficiency: 'Native' }],
        awards: [{ name: 'Award', issuer: null, date: null, description: null }],
        publications: [{ title: 'Paper', publisher: null, date: null, url: null, summary: null }],
        volunteering: [
          {
            organization: 'Code Club',
            role: null,
            startDate: null,
            endDate: null,
            summary: null,
          },
        ],
        interests: ['Typography'],
      }),
      'Fallback',
      'upload-1',
    );
    const types = result.document.pages.flatMap((page) =>
      page.sections.map((section) => section.type),
    );

    expect(types).toEqual(
      expect.arrayContaining([
        'soft-skills',
        'courses',
        'languages',
        'awards',
        'publications',
        'volunteering',
        'interests',
      ]),
    );
    expect(result.document.pages.length).toBeLessThanOrEqual(12);
    expect(parseSchema(portfolioDocumentSchema, result.document).ok).toBe(true);
  });

  it('drops blank optional collections and normalizes a safe course URL', () => {
    const result = mapExtractionToDocument(
      extraction({
        softSkills: [
          { label: null, detail: null },
          { label: ' '.repeat(3), detail: null },
        ],
        courses: [
          { name: null, provider: null, date: null, url: null, summary: null },
          { name: '  ', provider: null, date: null, url: null, summary: null },
          {
            name: 'Security',
            provider: null,
            date: null,
            url: 'https://example.com/course',
            summary: null,
          },
        ],
      }),
      'Fallback',
      'upload-1',
    );

    expect(result.document.softSkills).toEqual([]);
    expect(result.document.courses).toEqual([
      expect.objectContaining({ name: 'Security', url: 'https://example.com/course' }),
    ]);
  });

  it('puts supported social URLs in icon links and leaves unknown kinds as general links', () => {
    const result = mapExtractionToDocument(
      extraction({
        links: [
          { kind: 'github', url: 'https://github.com/amina' },
          { kind: 'personal-blog', url: 'https://example.com/writing' },
        ],
      }),
      'Fallback',
      'upload-1',
    );

    expect(result.document.socialLinks).toEqual([
      expect.objectContaining({ kind: 'github', url: 'https://github.com/amina', visible: true }),
    ]);
    expect(result.document.links).toEqual([
      expect.objectContaining({ kind: 'personal-blog', url: 'https://example.com/writing' }),
    ]);
  });

  describe('incomplete collection entries', () => {
    it('drops an education entry with no institution and reports it', () => {
      const result = mapExtractionToDocument(
        extraction({
          education: [
            {
              institution: null,
              degree: 'BSc',
              field: null,
              startDate: null,
              endDate: null,
              location: null,
              details: null,
            },
          ],
        }),
        'Fallback',
        'upload-1',
      );

      expect(result.document.education).toHaveLength(0);
      expect(parseSchema(portfolioDocumentSchema, result.document).ok).toBe(true);
    });

    it('drops a nameless certification rather than failing the whole import', () => {
      const result = mapExtractionToDocument(
        extraction({
          certifications: [{ name: null, issuer: 'CNCF', date: null, credentialUrl: null }],
        }),
        'Fallback',
        'upload-1',
      );

      expect(result.document.certifications).toHaveLength(0);
      expect(parseSchema(portfolioDocumentSchema, result.document).ok).toBe(true);
    });
  });

  it('carries the model’s own warnings through to the editor', () => {
    const result = mapExtractionToDocument(
      extraction({
        warnings: [{ code: 'AMBIGUOUS_DATE', path: 'experience.0', message: 'Unclear.' }],
      }),
      'Fallback',
      'upload-1',
    );

    expect(result.warnings[0]?.code).toBe('AMBIGUOUS_DATE');
  });

  it('shows a contact email only when one was found', () => {
    const withEmail = mapExtractionToDocument(
      extraction({ contact: { email: 'amina@example.com', phone: null } }),
      'Fallback',
      'upload-1',
    );
    const without = mapExtractionToDocument(extraction(), 'Fallback', 'upload-1');

    expect(withEmail.document.contact.email.visible).toBe(true);
    expect(without.document.contact.email.visible).toBe(false);
  });

  it('never makes a phone number public by default', () => {
    const result = mapExtractionToDocument(
      extraction({ contact: { email: null, phone: '+351 000' } }),
      'Fallback',
      'upload-1',
    );

    expect(result.document.contact.phone.visible).toBe(false);
  });

  it('separates a uniquely evidenced international prefix without publishing it', () => {
    const result = mapExtractionToDocument(
      extraction({ contact: { email: null, phone: '+351 912 345 678' } }),
      'Fallback',
      'upload-1',
    );

    expect(result.document.contact.phone).toEqual({
      countryIso: 'PT',
      nationalNumber: '912345678',
      visible: false,
    });
  });

  it('preserves an ambiguous shared calling plan without guessing a country', () => {
    const result = mapExtractionToDocument(
      extraction({ contact: { email: null, phone: '+1 202 555 0100' } }),
      'Fallback',
      'upload-1',
    );

    expect(result.document.contact.phone.countryIso).toBeNull();
    expect(result.document.contact.phone.nationalNumber).toBe('+1 202 555 0100');
  });
});
