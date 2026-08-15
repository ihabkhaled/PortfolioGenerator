import {
  DEFAULT_HOME_SECTIONS,
  DEFAULT_TEMPLATE_ID,
  HOME_PAGE_SLUG,
  PORTFOLIO_SCHEMA_VERSION,
} from '../constants/portfolio-document.constants';
import type { PortfolioDocument, PortfolioSection } from '../types/portfolio-document.types';

/**
 * A brand-new portfolio.
 *
 * The manual path matters: a user must be able to build a portfolio when the
 * AI provider or the upload pipeline is unavailable, so "empty document" is a
 * first-class, fully valid state — not a placeholder that only the importer
 * knows how to fill in.
 */
export function createEmptyPortfolioDocument(displayName: string): PortfolioDocument {
  return {
    schemaVersion: PORTFOLIO_SCHEMA_VERSION,
    identity: {
      displayName,
      headline: null,
      summary: null,
      location: null,
      nationality: null,
      militaryStatus: null,
      portraitAssetId: null,
      availabilityEnabled: false,
      tagline: null,
      availabilityNote: null,
      coverLetter: null,
    },
    contact: {
      email: { value: null, visible: false },
      phone: { countryIso: null, nationalNumber: null, visible: false },
    },
    links: [],
    socialLinks: [],
    experience: [],
    companies: [],
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
    testimonials: [],
    interests: [],
    gallery: [],
    attachments: [],
    pages: [
      {
        id: 'page-home',
        slug: HOME_PAGE_SLUG,
        title: 'Home',
        navLabel: 'Overview',
        description: null,
        visible: true,
        visibility: 'public',
        passwordHash: null,
        order: 0,
        sections: createDefaultHomeSections(),
      },
    ],
    theme: { templateId: DEFAULT_TEMPLATE_ID, mode: 'system', accent: 'default' },
    seo: { title: null, description: null, indexable: true },
    source: { kind: 'manual', resumeUploadId: null, pageOrder: null },
  };
}

/**
 * The default home page layout: the sections a CV almost always supports, in
 * the order a reader expects them. Sections whose collection is empty are
 * skipped at render time rather than removed here, so a user who later adds a
 * project does not have to rediscover the projects section.
 */
export function createDefaultHomeSections(): PortfolioSection[] {
  return DEFAULT_HOME_SECTIONS.map((section) => structuredClone(section) as PortfolioSection);
}
