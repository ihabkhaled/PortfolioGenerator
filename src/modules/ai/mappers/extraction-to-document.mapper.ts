import {
  createEmptyPortfolioDocument,
  DOCUMENT_COUNTS,
  MONTH_PATTERN,
  SOCIAL_LINK_KINDS,
  type PortfolioDocument,
  type PortfolioExperience,
  type PortfolioLink,
  type PortfolioPage,
  type PortfolioProject,
  type PortfolioSection,
  type PortfolioSkillGroup,
} from '@/modules/portfolio-document';
import { splitInternationalPhone } from '@/shared/utils/phone-number.util';
import { normalizeSafeUrl } from '@/shared/utils/safe-url.util';

import { WARNING_CODES } from '../constants/extraction.constants';
import {
  DEFAULT_SKILL_GROUP_LABEL,
  IMPORTED_PAGE_DEFINITIONS,
  LINK_LABELS,
} from '../constants/mapping.constants';
import type { ResumeExtractionResult } from '../types/ai-provider.types';
import type { ExtractionMappingResult, ImportedPageDefinition } from '../types/mapping.types';

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
  const socialLinks = mapSocialLinks(extraction, warnings);
  const experience = mapExperience(extraction, warnings);
  const projects = mapProjects(extraction, warnings);
  const skills = mapSkills(extraction);
  const phone =
    extraction.contact.phone === null ? null : splitInternationalPhone(extraction.contact.phone);

  const document: PortfolioDocument = {
    ...base,
    identity: {
      ...base.identity,
      headline: extraction.identity.headline,
      summary: extraction.identity.summary,
      location: extraction.identity.location,
      tagline: extraction.identity.tagline ?? null,
      coverLetter: extraction.identity.coverLetter ?? null,
      availabilityEnabled: extraction.identity.availabilityEnabled === true,
      availabilityNote: extraction.identity.availabilityNote ?? null,
    },
    contact: {
      // Visible by default only when present: an empty contact row on a public
      // page reads as a broken portfolio, and the editor makes turning it on
      // one click.
      email: { value: extraction.contact.email, visible: extraction.contact.email !== null },
      // A uniquely identifying international prefix can be separated as
      // evidence. Shared plans stay intact with no country rather than turning
      // a plausible location into a professional fact.
      phone: {
        countryIso: phone?.countryIso ?? null,
        nationalNumber: phone?.nationalNumber ?? null,
        visible: false,
      },
    },
    links,
    socialLinks,
    experience,
    projects,
    skills,
    softSkills: extraction.softSkills
      .slice(0, DOCUMENT_COUNTS.softSkills)
      .flatMap((entry, index) => {
        const label = entry.label?.trim() ?? '';
        return label === '' ? [] : [{ id: `soft-skill-${index + 1}`, label, detail: entry.detail }];
      }),
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
    courses: extraction.courses.slice(0, DOCUMENT_COUNTS.courses).flatMap((entry, index) => {
      const name = entry.name?.trim() ?? '';
      if (name === '') return [];
      return [
        {
          id: `course-${index + 1}`,
          name,
          provider: entry.provider,
          date: normalizeMonth(entry.date),
          url: entry.url === null ? null : normalizeSafeUrl(entry.url),
          summary: entry.summary,
        },
      ];
    }),
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
    publications: extraction.publications
      .slice(0, DOCUMENT_COUNTS.publications)
      .flatMap((entry, index) => {
        const title = entry.title?.trim() ?? '';
        if (title === '') return [];
        warnings.push(reviewWarning(`publications.${index}`));
        return [
          {
            id: `publication-${index + 1}`,
            title,
            publisher: entry.publisher,
            date: normalizeMonth(entry.date),
            url: entry.url === null ? null : normalizeSafeUrl(entry.url),
            summary: entry.summary,
          },
        ];
      }),
    volunteering: extraction.volunteering
      .slice(0, DOCUMENT_COUNTS.volunteering)
      .flatMap((entry, index) => {
        const organization = entry.organization?.trim() ?? '';
        if (organization === '') return [];
        warnings.push(reviewWarning(`volunteering.${index}`));
        return [
          {
            id: `volunteering-${index + 1}`,
            organization,
            role: entry.role,
            startDate: normalizeMonth(entry.startDate),
            endDate: normalizeMonth(entry.endDate),
            summary: entry.summary,
          },
        ];
      }),
    interests: [...new Set(extraction.interests.map((interest) => interest.trim()))]
      .filter(Boolean)
      .slice(0, DOCUMENT_COUNTS.interests)
      .map((interest, index) => {
        warnings.push(reviewWarning(`interests.${index}`));
        return interest;
      }),
    source: { kind: 'resume-import', resumeUploadId },
  };

  const cleaned = dropIncompleteEntries(document, warnings);
  return { document: { ...cleaned, pages: buildImportedPages(cleaned) }, warnings };
}

export function buildImportedPages(document: PortfolioDocument): PortfolioPage[] {
  const home = document.pages[0];
  if (home === undefined) return [];
  const pages: PortfolioPage[] = [home];

  if (document.experience.length > 0)
    pages.push(createImportedPage(document, IMPORTED_PAGE_DEFINITIONS.experience, pages.length));
  if (document.projects.length > 0)
    pages.push(createImportedPage(document, IMPORTED_PAGE_DEFINITIONS.projects, pages.length));
  if (document.skills.length > 0 || document.softSkills.length > 0 || document.languages.length > 0)
    pages.push(createImportedPage(document, IMPORTED_PAGE_DEFINITIONS.skills, pages.length));
  if (
    document.identity.summary !== null ||
    document.education.length > 0 ||
    document.certifications.length > 0 ||
    document.courses.length > 0 ||
    document.awards.length > 0 ||
    document.publications.length > 0 ||
    document.volunteering.length > 0 ||
    document.interests.length > 0 ||
    document.testimonials.length > 0 ||
    document.gallery.length > 0 ||
    document.attachments.length > 0
  )
    pages.push(createImportedPage(document, IMPORTED_PAGE_DEFINITIONS.about, pages.length));
  if (
    document.contact.email.visible ||
    document.contact.phone.visible ||
    document.links.length > 0 ||
    document.socialLinks.length > 0
  )
    pages.push(createImportedPage(document, IMPORTED_PAGE_DEFINITIONS.contact, pages.length));

  return pages;
}

export function createImportedPage(
  document: PortfolioDocument,
  definition: ImportedPageDefinition,
  index: number,
): PortfolioPage {
  const sections = definition.sectionTypes
    .filter((type) => hasSectionContent(document, type))
    .map((type, sectionIndex) => createImportedSection(type, definition.slug, sectionIndex));

  return {
    id: `page-${definition.slug}`,
    slug: definition.slug,
    title: definition.title,
    navLabel: definition.title,
    description: null,
    visible: true,
    visibility: 'public',
    passwordHash: null,
    order: index * 10,
    sections,
  };
}

export function reviewWarning(path: string): ExtractionMappingResult['warnings'][number] {
  return {
    code: WARNING_CODES.reviewExtractedFact,
    path,
    message: 'Review this extracted fact against the source document before publishing.',
  };
}

export function hasSectionContent(
  document: PortfolioDocument,
  type: PortfolioSection['type'],
): boolean {
  switch (type) {
    case 'about': {
      return document.identity.summary !== null;
    }
    case 'experience': {
      return document.experience.length > 0;
    }
    case 'projects': {
      return document.projects.length > 0;
    }
    case 'skills': {
      return document.skills.length > 0;
    }
    case 'soft-skills': {
      return document.softSkills.length > 0;
    }
    case 'education': {
      return document.education.length > 0;
    }
    case 'courses': {
      return document.courses.length > 0;
    }
    case 'certifications': {
      return document.certifications.length > 0;
    }
    case 'languages': {
      return document.languages.length > 0;
    }
    case 'publications': {
      return document.publications.length > 0;
    }
    case 'volunteering': {
      return document.volunteering.length > 0;
    }
    case 'awards': {
      return document.awards.length > 0;
    }
    case 'interests': {
      return document.interests.length > 0;
    }
    case 'testimonials': {
      return document.testimonials.length > 0;
    }
    case 'gallery': {
      return document.gallery.length > 0;
    }
    case 'attachments': {
      return document.attachments.some((entry) => entry.visible);
    }
    case 'social': {
      return document.socialLinks.some((entry) => entry.visible);
    }
    case 'contact': {
      return (
        document.contact.email.visible ||
        document.contact.phone.visible ||
        document.links.some((entry) => entry.visible)
      );
    }
    case 'hero': {
      return true;
    }
    case 'custom': {
      return false;
    }
  }
}

export function createImportedSection(
  type: PortfolioSection['type'],
  slug: string,
  index: number,
): PortfolioSection {
  const base = { id: `section-${slug}-${type}`, visible: true, order: index * 10 };
  switch (type) {
    case 'experience':
    case 'projects': {
      return { ...base, type, config: { title: null, limit: null } };
    }
    case 'contact': {
      return {
        ...base,
        type,
        config: { title: null, showEmail: true, showPhone: false, showLinks: true },
      };
    }
    case 'hero': {
      return { ...base, type, config: { showPortrait: true, showAvailability: false } };
    }
    case 'custom': {
      return { ...base, type, config: { title: null, blocks: [] } };
    }
    default: {
      return { ...base, type, config: { title: null } };
    }
  }
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
    if ((SOCIAL_LINK_KINDS as readonly string[]).includes(link.kind)) continue;
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

export function mapSocialLinks(
  extraction: ResumeExtractionResult,
  warnings: ExtractionMappingResult['warnings'],
): PortfolioDocument['socialLinks'] {
  const links: PortfolioDocument['socialLinks'][number][] = [];

  for (const [index, link] of extraction.links.slice(0, DOCUMENT_COUNTS.socialLinks).entries()) {
    if (!(SOCIAL_LINK_KINDS as readonly string[]).includes(link.kind)) continue;
    const url = normalizeSafeUrl(link.url);
    if (url === null) {
      warnings.push({
        code: WARNING_CODES.droppedInvalidUrl,
        path: `links.${index}`,
        message: 'A social link was removed because it was not a safe https address.',
      });
      continue;
    }

    links.push({
      id: `social-${links.length + 1}`,
      kind: link.kind as PortfolioDocument['socialLinks'][number]['kind'],
      label: null,
      url,
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
      // A project page is a decision, not a default. Giving every extracted
      // project a slug would fill the sitemap with pages holding two lines.
      slug: null,
      name,
      role: null,
      year: null,
      coverAssetId: null,
      featured: false,
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
                /* v8 ignore next -- LINK_LABELS declares 'project'; the fallback is for the index signature. */
                label: LINK_LABELS['project'] ?? 'Project',
                url,
                visible: true,
              },
            ],
      content: [],
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
    : [
        {
          id: 'skill-group-1',
          label: DEFAULT_SKILL_GROUP_LABEL,
          // A CV lists skills; it does not rank them, and a model asked to rank
          // them invents a confidence nobody stated. `working` is the claim the
          // document can actually support until a person says otherwise.
          tier: 'working',
          items,
        },
      ];
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
