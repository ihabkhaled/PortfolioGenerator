import type {
  PortfolioDocument,
  PortfolioSection,
  SectionOfType,
} from '@/modules/portfolio-document';

import type { FactEntry, TimelineEntry } from '../types/renderer.types';

import { formatDateRange, formatMonth } from './date-range.helper';

/**
 * Turns document collections into the flat view models the section components
 * render, and decides whether a section has anything to say.
 *
 * `hasContent` is the load-bearing one. A template that renders a heading for
 * every section type produces a portfolio full of empty "Projects" and
 * "Certifications" bands for the many real CVs that have neither — which looks
 * broken, not minimal.
 */

export function buildExperienceEntries(
  document: PortfolioDocument,
  limit: number | null,
  presentLabel: string,
): readonly TimelineEntry[] {
  const entries = document.experience.map((role) => ({
    id: role.id,
    organization: role.organization,
    role: role.title,
    dateRange: formatDateRange(role.startDate, role.endDate, role.current, presentLabel),
    summary: role.summary,
    highlights: role.highlights,
    tags: role.technologies,
  }));

  return limit === null ? entries : entries.slice(0, limit);
}

export function buildEducationEntries(document: PortfolioDocument): readonly FactEntry[] {
  return document.education.map((entry) => ({
    id: entry.id,
    title: entry.institution,
    subtitle: joinNonEmpty([entry.degree, entry.field], ', '),
    meta: formatDateRange(entry.startDate, entry.endDate, false, ''),
    detail: entry.details,
    link: null,
  }));
}

export function buildCertificationEntries(document: PortfolioDocument): readonly FactEntry[] {
  return document.certifications.map((entry) => ({
    id: entry.id,
    title: entry.name,
    subtitle: entry.issuer,
    meta: formatMonth(entry.date),
    detail: null,
    link: entry.credentialUrl,
  }));
}

export function buildLanguageEntries(document: PortfolioDocument): readonly FactEntry[] {
  return document.languages.map((entry) => ({
    id: entry.id,
    title: entry.name,
    subtitle: entry.proficiency,
    meta: null,
    detail: null,
    link: null,
  }));
}

export function buildSoftSkillEntries(document: PortfolioDocument): readonly FactEntry[] {
  return document.softSkills.map((entry) => ({
    id: entry.id,
    title: entry.label,
    subtitle: null,
    meta: null,
    detail: entry.detail,
    link: null,
  }));
}

export function buildCourseEntries(document: PortfolioDocument): readonly FactEntry[] {
  return document.courses.map((entry) => ({
    id: entry.id,
    title: entry.name,
    subtitle: entry.provider,
    meta: formatMonth(entry.date),
    detail: entry.summary,
    link: entry.url,
  }));
}

export function buildPublicationEntries(document: PortfolioDocument): readonly FactEntry[] {
  return document.publications.map((entry) => ({
    id: entry.id,
    title: entry.title,
    subtitle: entry.publisher,
    meta: formatMonth(entry.date),
    detail: entry.summary,
    link: entry.url,
  }));
}

export function buildAwardEntries(document: PortfolioDocument): readonly FactEntry[] {
  return document.awards.map((entry) => ({
    id: entry.id,
    title: entry.name,
    subtitle: entry.issuer,
    meta: formatMonth(entry.date),
    detail: entry.description,
    link: null,
  }));
}

export function buildVolunteeringEntries(
  document: PortfolioDocument,
  presentLabel: string,
): readonly TimelineEntry[] {
  return document.volunteering.map((entry) => ({
    id: entry.id,
    organization: entry.organization,
    role: entry.role ?? '',
    dateRange: formatDateRange(
      entry.startDate,
      entry.endDate,
      entry.endDate === null,
      presentLabel,
    ),
    summary: entry.summary,
    highlights: [],
    tags: [],
  }));
}

export function joinNonEmpty(values: readonly (string | null)[], separator: string): string | null {
  const present = values.filter((value): value is string => value !== null && value.trim() !== '');

  return present.length === 0 ? null : present.join(separator);
}

export function splitParagraphs(text: string): readonly string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Whether a section would render anything. Built-in sections are backed by a
 * document collection, so "empty collection" and "nothing to show" are the
 * same question.
 */
export function hasContent(section: PortfolioSection, document: PortfolioDocument): boolean {
  switch (section.type) {
    case 'hero': {
      return true;
    }

    case 'about': {
      return (
        (document.identity.summary !== null && document.identity.summary.trim() !== '') ||
        document.publications.length > 0 ||
        document.awards.length > 0 ||
        document.interests.length > 0 ||
        document.testimonials.length > 0 ||
        document.gallery.length > 0 ||
        document.attachments.some((entry) => entry.visible)
      );
    }

    case 'experience': {
      return document.experience.length > 0 || document.volunteering.length > 0;
    }

    case 'projects': {
      return document.projects.length > 0;
    }

    case 'skills': {
      return (
        document.skills.some((group) => group.items.length > 0) || document.softSkills.length > 0
      );
    }

    case 'soft-skills': {
      return document.softSkills.length > 0;
    }

    case 'education': {
      return document.education.length > 0;
    }

    case 'certifications': {
      return document.certifications.length > 0 || document.courses.length > 0;
    }

    case 'courses': {
      return document.courses.length > 0;
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
      return hasContactContent(section, document);
    }

    case 'custom': {
      return section.config.blocks.length > 0;
    }
  }
}

export function hasContactContent(
  section: SectionOfType<'contact'>,
  document: PortfolioDocument,
): boolean {
  const isShowsEmail =
    section.config.showEmail &&
    document.contact.email.visible &&
    document.contact.email.value !== null;
  const isShowsPhone =
    section.config.showPhone &&
    document.contact.phone.visible &&
    document.contact.phone.nationalNumber !== null;
  const isShowsLinks =
    section.config.showLinks && document.socialLinks.some((link) => link.visible);

  return isShowsEmail || isShowsPhone || isShowsLinks;
}

/** The visible links, in document order. */
export function visibleLinks(
  document: PortfolioDocument,
): readonly PortfolioDocument['links'][number][] {
  return document.links.filter((link) => link.visible);
}
