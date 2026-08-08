import { describe, expect, it } from 'vitest';

import { portfolioDocumentSchema } from '@/modules/portfolio-document';
import { parseSchema } from '@/packages/zod';

import { WARNING_CODES } from '../constants/extraction.constants';
import { mapExtractionToDocument, normalizeMonth } from '../mappers/extraction-to-document.mapper';
import type { ResumeExtractionResult } from '../types/ai-provider.types';

/**
 * The mapper is where untrusted model output becomes a draft. Its contract is
 * "drop, do not guess", and every test here is a way a model gets things wrong.
 */

function extraction(overrides: Partial<ResumeExtractionResult> = {}): ResumeExtractionResult {
  return {
    identity: { displayName: 'Amina Rahman', headline: 'Engineer', summary: null, location: null },
    contact: { email: null, phone: null },
    links: [],
    experience: [],
    projects: [],
    skills: [],
    education: [],
    certifications: [],
    languages: [],
    awards: [],
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
  it('produces a document the canonical schema accepts', () => {
    const result = mapExtractionToDocument(extraction(), 'Fallback Name', 'upload-1');

    expect(parseSchema(portfolioDocumentSchema, result.document).ok).toBe(true);
  });

  it('records the upload it came from', () => {
    const result = mapExtractionToDocument(extraction(), 'Fallback', 'upload-42');

    expect(result.document.source).toEqual({ kind: 'resume-import', resumeUploadId: 'upload-42' });
  });

  it('falls back to the account name when the model found no name', () => {
    const result = mapExtractionToDocument(
      extraction({
        identity: { displayName: null, headline: null, summary: null, location: null },
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

      expect(result.document.links[0]).toMatchObject({ label: 'GitHub', visible: true });
    });

    it('falls back to the raw kind for an unfamiliar link type', () => {
      const result = mapExtractionToDocument(
        extraction({ links: [{ kind: 'mastodon', url: 'https://example.com/a' }] }),
        'Fallback',
        'upload-1',
      );

      expect(result.document.links[0]?.label).toBe('mastodon');
    });
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
});
