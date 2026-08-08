/**
 * Bounds for the canonical document.
 *
 * Every one of these is a denial-of-service control as much as a product
 * decision: the document is user-authored JSON that is validated on every
 * save, stored whole, and rendered whole. Unbounded arrays and unbounded
 * strings would make a single portfolio able to degrade the whole platform.
 */

export const PORTFOLIO_SCHEMA_VERSION = 1;

export const DOCUMENT_LIMITS = {
  displayName: 120,
  headline: 180,
  summary: 3000,
  location: 160,
  assetId: 120,
  id: 120,
  email: 320,
  phone: 80,
  url: 2048,
  linkLabel: 80,
  linkKind: 40,
  organization: 200,
  jobTitle: 200,
  roleSummary: 1500,
  highlight: 700,
  technology: 80,
  projectName: 180,
  projectSummary: 2000,
  skillGroupLabel: 100,
  skillItem: 80,
  institution: 200,
  degree: 200,
  field: 200,
  educationDetails: 1500,
  certificationName: 240,
  issuer: 200,
  languageName: 100,
  proficiency: 100,
  awardName: 240,
  awardDescription: 1200,
  pageSlug: 80,
  pageTitle: 120,
  navLabel: 80,
  sectionTitle: 120,
  seoTitle: 120,
  seoDescription: 320,
  accent: 40,
  templateId: 80,
  blockText: 2000,
  blockItem: 300,
  statLabel: 80,
  statValue: 80,
} as const;

export const DOCUMENT_COUNTS = {
  links: 20,
  experience: 40,
  experienceHighlights: 20,
  technologies: 60,
  projects: 50,
  projectHighlights: 20,
  projectLinks: 10,
  skillGroups: 30,
  skillItems: 80,
  education: 30,
  certifications: 50,
  languages: 30,
  awards: 50,
  pages: 12,
  sectionsPerPage: 30,
  blocksPerCustomSection: 12,
  itemsPerBlock: 20,
} as const;

/** Section kinds the renderer knows how to draw. Adding one is a schema change. */
export const SECTION_TYPES = [
  'hero',
  'about',
  'experience',
  'projects',
  'skills',
  'education',
  'certifications',
  'languages',
  'contact',
  'custom',
] as const;

/** Bounded, non-executable content blocks. No HTML, no script, no embed. */
export const CUSTOM_BLOCK_KINDS = ['paragraph', 'bullet-list', 'stat-list', 'links'] as const;

export const THEME_MODES = ['light', 'dark', 'system'] as const;

/** Named accents only — a raw colour value would be user-supplied CSS. */
export const THEME_ACCENTS = ['default', 'violet', 'emerald', 'amber', 'slate'] as const;

export const SOURCE_KINDS = ['manual', 'resume-import', 'mixed'] as const;

export const DEFAULT_TEMPLATE_ID = 'reference-classic-v1';

/** The home page is addressed by the portfolio slug alone. */
export const HOME_PAGE_SLUG = '';

/**
 * A page slug becomes a URL segment. Anything outside the allowed shape —
 * dots, path separators, percent-encoding, unicode confusables — is rejected
 * rather than sanitized, because sanitizing user input into a path is how
 * traversal bugs are born. The shape is checked by `hasValidSlugShape`, a
 * linear scan rather than a backtracking pattern.
 */
export const PAGE_SLUG_MAX_LENGTH = 80;

/** `YYYY-MM`; a CV rarely justifies day precision and never justifies a time. */
export const MONTH_PATTERN = /^\d{4}-(?:0[1-9]|1[0-2])$/;

/**
 * The default home page layout: the sections a CV almost always supports, in
 * the order a reader expects them. `order` leaves gaps of ten so a user can
 * insert a section between two existing ones without renumbering the page.
 *
 * Typed as the schema output shape at the point of use; kept here so a new
 * portfolio and a reset-to-default action cannot drift apart.
 */
export const DEFAULT_HOME_SECTIONS = [
  {
    id: 'section-hero',
    type: 'hero',
    visible: true,
    order: 0,
    config: { showPortrait: true, showAvailability: false },
  },
  { id: 'section-about', type: 'about', visible: true, order: 10, config: { title: null } },
  {
    id: 'section-experience',
    type: 'experience',
    visible: true,
    order: 20,
    config: { title: null, limit: null },
  },
  {
    id: 'section-projects',
    type: 'projects',
    visible: true,
    order: 30,
    config: { title: null, limit: null },
  },
  { id: 'section-skills', type: 'skills', visible: true, order: 40, config: { title: null } },
  { id: 'section-education', type: 'education', visible: true, order: 50, config: { title: null } },
  {
    id: 'section-certifications',
    type: 'certifications',
    visible: true,
    order: 60,
    config: { title: null },
  },
  { id: 'section-languages', type: 'languages', visible: true, order: 70, config: { title: null } },
  {
    id: 'section-contact',
    type: 'contact',
    visible: true,
    order: 80,
    config: { title: null, showEmail: true, showPhone: false, showLinks: true },
  },
] as const;
