import { describe, expect, it } from 'vitest';

import {
  dropIncompleteEntries,
  mapExtractionToDocument,
  parseDeterministicResume,
  WARNING_CODES,
  type ResumeExtractionResult,
} from '@/modules/ai';
import {
  createEmptyPortfolioDocument,
  portfolioDocumentSchema,
  resolvePageSlug,
} from '@/modules/portfolio-document';
import { setSeoField } from '@/modules/portfolio-editor';
import { formatMonth } from '@/modules/portfolio-renderer';
import { parseSchema } from '@/packages/zod';

import { buildFullPortfolioDocument } from '../fixtures/portfolio-document.fixtures';

/**
 * The paths the main suites reach around rather than through: sections a CV
 * often has and a fixture rarely does, and the "the model returned an empty
 * one" case for each of them.
 */

function extraction(overrides: Partial<ResumeExtractionResult> = {}): ResumeExtractionResult {
  return {
    identity: { displayName: 'Amina Rahman', headline: 'Engineer', summary: null, location: null },
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

describe('mapping the tail sections of a CV', () => {
  it('maps certifications, languages and awards with generated ids', () => {
    const result = mapExtractionToDocument(
      extraction({
        certifications: [
          {
            name: 'Certified Kubernetes Administrator',
            issuer: 'CNCF',
            date: '2022-04',
            credentialUrl: 'https://example.com/credential/cka',
          },
        ],
        languages: [{ name: 'Portuguese', proficiency: 'Native' }],
        awards: [
          { name: 'Employee of the year', issuer: 'Northwind', date: '2021-12', description: null },
        ],
      }),
      'Amina Rahman',
      'upload-1',
    );

    expect(result.document.certifications[0]).toMatchObject({
      id: 'cert-1',
      name: 'Certified Kubernetes Administrator',
      credentialUrl: 'https://example.com/credential/cka',
    });
    expect(result.document.languages[0]).toMatchObject({ id: 'lang-1', name: 'Portuguese' });
    expect(result.document.awards[0]).toMatchObject({ id: 'award-1', date: '2021-12' });
  });

  // "Drop, do not guess": an unusable date becomes absent, not a made-up one.
  it('drops an unreadable certification date rather than inventing one', () => {
    const result = mapExtractionToDocument(
      extraction({
        certifications: [
          { name: 'AWS', issuer: null, date: 'sometime in 2022', credentialUrl: null },
        ],
      }),
      'Amina Rahman',
      'upload-1',
    );

    expect(result.document.certifications[0]?.date).toBeNull();
  });

  it('refuses a credential URL that is not publishable', () => {
    const result = mapExtractionToDocument(
      extraction({
        certifications: [
          { name: 'AWS', issuer: null, date: null, credentialUrl: 'javascript:alert(1)' },
        ],
      }),
      'Amina Rahman',
      'upload-1',
    );

    expect(result.document.certifications[0]?.credentialUrl).toBeNull();
  });

  it('produces a document that still validates', () => {
    const result = mapExtractionToDocument(
      extraction({
        languages: [{ name: 'English', proficiency: null }],
        awards: [{ name: 'Prize', issuer: null, date: null, description: 'For work.' }],
      }),
      'Amina Rahman',
      'upload-1',
    );

    expect(parseSchema(portfolioDocumentSchema, result.document).ok).toBe(true);
  });
});

describe('dropIncompleteEntries', () => {
  it('drops a nameless language and says which one', () => {
    const document = createEmptyPortfolioDocument('Amina Rahman');
    const warnings: { code: string; path: string; message: string }[] = [];
    const result = dropIncompleteEntries(
      {
        ...document,
        languages: [
          { id: 'lang-1', name: '  ', proficiency: null },
          { id: 'lang-2', name: 'English', proficiency: null },
        ],
      },
      warnings,
    );

    expect(result.languages).toHaveLength(1);
    expect(warnings[0]).toMatchObject({
      code: WARNING_CODES.droppedIncompleteEntry,
      path: 'languages.0',
    });
  });

  it('drops a nameless award', () => {
    const document = createEmptyPortfolioDocument('Amina Rahman');
    const warnings: { code: string; path: string; message: string }[] = [];
    const result = dropIncompleteEntries(
      {
        ...document,
        awards: [{ id: 'award-1', name: '', issuer: null, date: null, description: null }],
      },
      warnings,
    );

    expect(result.awards).toEqual([]);
    expect(warnings.map((warning) => warning.path)).toContain('awards.0');
  });

  it('drops a nameless certification', () => {
    const document = createEmptyPortfolioDocument('Amina Rahman');
    const warnings: { code: string; path: string; message: string }[] = [];
    const result = dropIncompleteEntries(
      {
        ...document,
        certifications: [
          { id: 'cert-1', name: ' ', issuer: null, date: null, credentialUrl: null },
        ],
      },
      warnings,
    );

    expect(result.certifications).toEqual([]);
    expect(warnings.map((warning) => warning.path)).toContain('certifications.0');
  });

  it('leaves a complete document untouched and warns about nothing', () => {
    const warnings: { code: string; path: string; message: string }[] = [];

    dropIncompleteEntries(buildFullPortfolioDocument(), warnings);

    expect(warnings).toEqual([]);
  });
});

describe('parseDeterministicResume on awkward layouts', () => {
  it('reads a role whose dates are on the line below it', () => {
    const result = parseDeterministicResume(
      ['Amina Rahman', 'EXPERIENCE', 'Senior Engineer — Northwind', '2020-06 - Present'].join('\n'),
    );

    expect(result.experience[0]).toMatchObject({ current: true, startDate: '2020-06' });
  });

  // A date the parser cannot read is reported, not guessed at.
  it('warns when a start date cannot be read confidently', () => {
    const result = parseDeterministicResume(
      ['Amina Rahman', 'EXPERIENCE', 'Senior Engineer — Northwind', 'sometime — 2021-04'].join(
        '\n',
      ),
    );

    expect(result.warnings.map((warning) => warning.code)).toContain(WARNING_CODES.ambiguousDate);
  });

  it('reports a line in the experience section it could not read as a role', () => {
    const result = parseDeterministicResume(
      ['Amina Rahman', 'EXPERIENCE', 'references available on request'].join('\n'),
    );

    expect(result.warnings.map((warning) => warning.code)).toContain(
      WARNING_CODES.droppedIncompleteEntry,
    );
  });
});

describe('formatMonth on values the schema does not police', () => {
  // A plausible-looking wrong date is worse than no date at all.
  it('returns null for a month outside 01-12 rather than a partial date', () => {
    expect(formatMonth('2020-13')).toBeNull();
  });

  it('returns null for a value with no month part at all', () => {
    expect(formatMonth('2020')).toBeNull();
  });
});

describe('setSeoField', () => {
  it('keeps the value the user typed when it is not blank', () => {
    const next = setSeoField(buildFullPortfolioDocument(), 'description', 'A short description.');

    expect(next.seo.description).toBe('A short description.');
  });
});

describe('resolvePageSlug', () => {
  it('treats an absent catch-all as the home page', () => {
    expect(resolvePageSlug(undefined)).toBe('');
  });

  it('treats an empty catch-all as the home page', () => {
    expect(resolvePageSlug([])).toBe('');
  });

  // Two segments would be a portfolio with nested pages, which does not exist.
  it('refuses more than one segment', () => {
    expect(resolvePageSlug(['projects', 'ledger'])).toBeNull();
  });
});

describe('mapping entries the model left partly empty', () => {
  // Every extraction field is nullable so the model always has a legal way to
  // say "not present"; the mapper is where that becomes a document.
  it('accepts a nameless language and lets the drop pass remove it', () => {
    const result = mapExtractionToDocument(
      extraction({ languages: [{ name: null, proficiency: 'Native' }] }),
      'Amina Rahman',
      'upload-1',
    );

    expect(result.document.languages).toEqual([]);
  });

  it('accepts a nameless award and lets the drop pass remove it', () => {
    const result = mapExtractionToDocument(
      extraction({ awards: [{ name: null, issuer: null, date: null, description: null }] }),
      'Amina Rahman',
      'upload-1',
    );

    expect(result.document.awards).toEqual([]);
  });

  // A CV line that gives an employer but no role still describes a job.
  it('uses the organization as the title when only one of the two is present', () => {
    const result = mapExtractionToDocument(
      extraction({
        experience: [
          {
            organization: 'Northwind Payments',
            title: null,
            location: null,
            startDate: null,
            endDate: null,
            current: false,
            summary: null,
            highlights: [],
            technologies: [],
          },
        ],
      }),
      'Amina Rahman',
      'upload-1',
    );

    expect(result.document.experience[0]).toMatchObject({
      organization: 'Northwind Payments',
      title: 'Northwind Payments',
    });
  });

  it('turns a project URL into a single labelled link', () => {
    const result = mapExtractionToDocument(
      extraction({
        projects: [
          {
            name: 'Ledger Replay',
            summary: null,
            highlights: [],
            technologies: [],
            url: 'https://example.com/ledger-replay',
          },
        ],
      }),
      'Amina Rahman',
      'upload-1',
    );

    expect(result.document.projects[0]?.links).toEqual([
      {
        id: 'proj-1-link',
        kind: 'project',
        label: 'Project',
        url: 'https://example.com/ledger-replay',
        visible: true,
      },
    ]);
  });

  it('drops a project URL that is not publishable', () => {
    const result = mapExtractionToDocument(
      extraction({
        projects: [
          {
            name: 'Ledger Replay',
            summary: null,
            highlights: [],
            technologies: [],
            url: 'javascript:alert(1)',
          },
        ],
      }),
      'Amina Rahman',
      'upload-1',
    );

    expect(result.document.projects[0]?.links).toEqual([]);
  });
});

describe('parseDeterministicResume on punctuation and month names', () => {
  it('strips punctuation wrapped around a contact token', () => {
    const result = parseDeterministicResume(['Amina Rahman', '(amina@example.com).'].join('\n'));

    expect(result.contact.email).toBe('amina@example.com');
  });

  it('reads a month written by name', () => {
    const result = parseDeterministicResume(
      ['Amina Rahman', 'EXPERIENCE', 'Senior Engineer — Northwind', 'Jan 2020 - Mar 2023'].join(
        '\n',
      ),
    );

    expect(result.experience[0]).toMatchObject({ startDate: '2020-01', endDate: '2023-03' });
  });

  it('refuses a month name it does not recognise rather than guessing', () => {
    const result = parseDeterministicResume(
      ['Amina Rahman', 'EXPERIENCE', 'Senior Engineer — Northwind', 'Xxx 2020 - Present'].join(
        '\n',
      ),
    );

    expect(result.experience[0]?.startDate).toBeNull();
  });
});

describe('mapping a role or project with the other half missing', () => {
  it('uses the title as the organization when only the role is present', () => {
    const result = mapExtractionToDocument(
      extraction({
        experience: [
          {
            organization: null,
            title: 'Senior Backend Engineer',
            location: null,
            startDate: null,
            endDate: null,
            current: false,
            summary: null,
            highlights: [],
            technologies: [],
          },
        ],
      }),
      'Amina Rahman',
      'upload-1',
    );

    expect(result.document.experience[0]).toMatchObject({
      organization: 'Senior Backend Engineer',
      title: 'Senior Backend Engineer',
    });
  });

  it('keeps a project that has no URL at all', () => {
    const result = mapExtractionToDocument(
      extraction({
        projects: [
          { name: 'Budget Alarm', summary: null, highlights: [], technologies: [], url: null },
        ],
      }),
      'Amina Rahman',
      'upload-1',
    );

    expect(result.document.projects[0]).toMatchObject({ name: 'Budget Alarm', links: [] });
  });
});

describe('parseDeterministicResume on lines that half-parse', () => {
  // A separator with nothing on one side of it is not a role line.
  // A separator with nothing between it and the next one — the shape a
  // table-based CV produces when a column comes out of the PDF empty.
  it('drops a role line whose second field is empty rather than guessing', () => {
    const result = parseDeterministicResume(
      ['Amina Rahman', 'EXPERIENCE', 'Northwind |  | Lisbon'].join('\n'),
    );

    expect(result.experience).toEqual([]);
    expect(result.warnings.map((warning) => warning.code)).toContain(
      WARNING_CODES.droppedIncompleteEntry,
    );
  });

  // A bullet before any role has been read has nothing to attach to.
  it('ignores a highlight that appears before its role', () => {
    const result = parseDeterministicResume(
      [
        'Amina Rahman',
        'EXPERIENCE',
        '- Rebuilt settlement reconciliation',
        'Senior Engineer — Northwind',
      ].join('\n'),
    );

    expect(result.experience).toHaveLength(1);
    expect(result.experience[0]?.highlights).toEqual([]);
  });
});
