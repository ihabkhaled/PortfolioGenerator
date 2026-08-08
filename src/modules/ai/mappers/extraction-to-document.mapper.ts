import {
  createEmptyPortfolioDocument,
  DOCUMENT_COUNTS,
  MONTH_PATTERN,
  type PortfolioDocument,
  type PortfolioExperience,
  type PortfolioLink,
  type PortfolioProject,
  type PortfolioSkillGroup,
} from '@/modules/portfolio-document';
import { normalizeSafeUrl } from '@/shared/utils/safe-url.util';

import { WARNING_CODES } from '../constants/extraction.constants';
import { DEFAULT_SKILL_GROUP_LABEL, LINK_LABELS } from '../constants/mapping.constants';
import type { ResumeExtractionResult } from '../types/ai-provider.types';
import type { ExtractionMappingResult } from '../types/mapping.types';

/**
 * Extraction output to a draft document.
 *
 * This is the deterministic-repair layer the cost design depends on: rather
 * than sending a whole CV back to a model because one date is malformed, the
 * mapper drops or fixes what it can locally and records a warning the user can
 * act on. Only what survives none of that is worth a second model call.
 *
 * The rule throughout is "drop, do not guess". An unparseable date becomes
 * null with a warning; an unsafe URL is removed with a warning; an experience
 * entry missing both an organisation and a title is dropped entirely. A
 * plausible-looking wrong fact is worse than a visible gap, because the user
 * skims past the first and fixes the second.
 */

export function mapExtractionToDocument(
  extraction: ResumeExtractionResult,
  displayNameFallback: string,
  resumeUploadId: string,
): ExtractionMappingResult {
  const warnings = [...extraction.warnings];
  const base = createEmptyPortfolioDocument(
    extraction.identity.displayName?.trim() || displayNameFallback,
  );

  const links = mapLinks(extraction, warnings);
  const experience = mapExperience(extraction, warnings);
  const projects = mapProjects(extraction, warnings);
  const skills = mapSkills(extraction);

  const document: PortfolioDocument = {
    ...base,
    identity: {
      ...base.identity,
      headline: extraction.identity.headline,
      summary: extraction.identity.summary,
      location: extraction.identity.location,
    },
    contact: {
      // Visible by default only when present: an empty contact row on a public
      // page reads as a broken portfolio, and the editor makes turning it on
      // one click.
      email: { value: extraction.contact.email, visible: extraction.contact.email !== null },
      phone: { value: extraction.contact.phone, visible: false },
    },
    links,
    experience,
    projects,
    skills,
    education: extraction.education.slice(0, DOCUMENT_COUNTS.education).map((entry, index) => ({
      id: `edu-${index + 1}`,
      institution: entry.institution ?? '',
      degree: entry.degree,
      field: entry.field,
      startDate: normalizeMonth(entry.startDate),
      endDate: normalizeMonth(entry.endDate),
      location: entry.location,
      details: entry.details,
    })),
    certifications: extraction.certifications
      .slice(0, DOCUMENT_COUNTS.certifications)
      .map((entry, index) => ({
        id: `cert-${index + 1}`,
        name: entry.name ?? '',
        issuer: entry.issuer,
        date: normalizeMonth(entry.date),
        credentialUrl: entry.credentialUrl === null ? null : normalizeSafeUrl(entry.credentialUrl),
      })),
    languages: extraction.languages.slice(0, DOCUMENT_COUNTS.languages).map((entry, index) => ({
      id: `lang-${index + 1}`,
      name: entry.name ?? '',
      proficiency: entry.proficiency,
    })),
    awards: extraction.awards.slice(0, DOCUMENT_COUNTS.awards).map((entry, index) => ({
      id: `award-${index + 1}`,
      name: entry.name ?? '',
      issuer: entry.issuer,
      date: normalizeMonth(entry.date),
      description: entry.description,
    })),
    source: { kind: 'resume-import', resumeUploadId },
  };

  return {
    document: dropIncompleteEntries(document, warnings),
    warnings,
  };
}

/** A date the model could not express as `YYYY-MM` becomes absent, never invented. */
export function normalizeMonth(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const trimmed = value.trim();

  return MONTH_PATTERN.test(trimmed) ? trimmed : null;
}

export function mapLinks(
  extraction: ResumeExtractionResult,
  warnings: ExtractionMappingResult['warnings'],
): PortfolioLink[] {
  const links: PortfolioLink[] = [];

  for (const [index, link] of extraction.links.slice(0, DOCUMENT_COUNTS.links).entries()) {
    const url = normalizeSafeUrl(link.url);

    if (url === null) {
      warnings.push({
        code: WARNING_CODES.droppedInvalidUrl,
        path: `links.${index}`,
        message: 'A link was removed because it was not a safe https address.',
      });

      continue;
    }

    links.push({
      id: `link-${links.length + 1}`,
      kind: link.kind,
      label: LINK_LABELS[link.kind] ?? link.kind,
      url,
      // Visible by default: a link the user put on their CV is one they want
      // seen, and the editor makes hiding it trivial.
      visible: true,
    });
  }

  return links;
}

export function mapExperience(
  extraction: ResumeExtractionResult,
  warnings: ExtractionMappingResult['warnings'],
): PortfolioExperience[] {
  const entries: PortfolioExperience[] = [];

  for (const [index, role] of extraction.experience
    .slice(0, DOCUMENT_COUNTS.experience)
    .entries()) {
    const organization = role.organization?.trim() ?? '';
    const title = role.title?.trim() ?? '';

    if (organization === '' && title === '') {
      warnings.push({
        code: WARNING_CODES.droppedIncompleteEntry,
        path: `experience.${index}`,
        message: 'A role was dropped because it had neither an employer nor a title.',
      });

      continue;
    }

    if (role.endDate !== null && normalizeMonth(role.endDate) === null) {
      warnings.push({
        code: WARNING_CODES.ambiguousDate,
        path: `experience.${index}.endDate`,
        message: 'The end date was unclear and has been left empty.',
      });
    }

    entries.push({
      id: `exp-${entries.length + 1}`,
      organization: organization || title,
      title: title || organization,
      location: role.location,
      startDate: normalizeMonth(role.startDate),
      endDate: normalizeMonth(role.endDate),
      current: role.current,
      summary: role.summary,
      highlights: role.highlights.slice(0, DOCUMENT_COUNTS.experienceHighlights),
      technologies: role.technologies.slice(0, DOCUMENT_COUNTS.technologies),
    });
  }

  return entries;
}

export function mapProjects(
  extraction: ResumeExtractionResult,
  warnings: ExtractionMappingResult['warnings'],
): PortfolioProject[] {
  const projects: PortfolioProject[] = [];

  for (const [index, project] of extraction.projects.slice(0, DOCUMENT_COUNTS.projects).entries()) {
    const name = project.name?.trim() ?? '';

    if (name === '') {
      warnings.push({
        code: WARNING_CODES.droppedIncompleteEntry,
        path: `projects.${index}`,
        message: 'A project was dropped because it had no name.',
      });

      continue;
    }

    const url = project.url === null ? null : normalizeSafeUrl(project.url);

    projects.push({
      id: `proj-${projects.length + 1}`,
      name,
      summary: project.summary,
      highlights: project.highlights.slice(0, DOCUMENT_COUNTS.projectHighlights),
      technologies: project.technologies.slice(0, DOCUMENT_COUNTS.technologies),
      links:
        url === null
          ? []
          : [
              {
                id: `proj-${projects.length + 1}-link`,
                kind: 'project',
                label: LINK_LABELS['project'] ?? 'Project',
                url,
                visible: true,
              },
            ],
    });
  }

  return projects;
}

/**
 * One group to start with.
 *
 * Grouping skills by discipline is a judgement call, and a model asked to make
 * it produces confident nonsense ("Kubernetes" under "Languages"). One honest
 * group the user can split in the editor beats a taxonomy nobody asked for.
 */
export function mapSkills(extraction: ResumeExtractionResult): PortfolioSkillGroup[] {
  const items = [...new Set(extraction.skills.map((skill) => skill.trim()))]
    .filter((skill) => skill.length > 0)
    .slice(0, DOCUMENT_COUNTS.skillItems);

  return items.length === 0
    ? []
    : [{ id: 'skill-group-1', label: DEFAULT_SKILL_GROUP_LABEL, items }];
}

/**
 * Remove entries whose required fields ended up empty.
 *
 * The document schema requires a non-empty institution, certification name and
 * so on. Rather than let a whole import fail validation because one line of a
 * CV was unreadable, the unusable entry is dropped and reported.
 */
export function dropIncompleteEntries(
  document: PortfolioDocument,
  warnings: ExtractionMappingResult['warnings'],
): PortfolioDocument {
  function report(collection: string, index: number): void {
    warnings.push({
      code: WARNING_CODES.droppedIncompleteEntry,
      path: `${collection}.${index}`,
      message: 'An entry was dropped because a required field was empty.',
    });
  }

  return {
    ...document,
    education: document.education.filter((entry, index) => {
      const keep = entry.institution.trim() !== '';

      if (!keep) {
        report('education', index);
      }

      return keep;
    }),
    certifications: document.certifications.filter((entry, index) => {
      const keep = entry.name.trim() !== '';

      if (!keep) {
        report('certifications', index);
      }

      return keep;
    }),
    languages: document.languages.filter((entry, index) => {
      const keep = entry.name.trim() !== '';

      if (!keep) {
        report('languages', index);
      }

      return keep;
    }),
    awards: document.awards.filter((entry, index) => {
      const keep = entry.name.trim() !== '';

      if (!keep) {
        report('awards', index);
      }

      return keep;
    }),
  };
}
