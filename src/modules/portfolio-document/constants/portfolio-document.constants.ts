/**
 * Bounds for the canonical document.
 *
 * Every one of these is a denial-of-service control as much as a product
 * decision: the document is user-authored JSON that is validated on every
 * save, stored whole, and rendered whole. Unbounded arrays and unbounded
 * strings would make a single portfolio able to degrade the whole platform.
 */

export const PORTFOLIO_SCHEMA_VERSION = 3;

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
  tagline: 200,
  availabilityNote: 200,
  coverLetter: 6000,
  countryIso: 2,
  nationalNumber: 40,
  softSkill: 120,
  softSkillDetail: 400,
  courseName: 240,
  provider: 200,
  courseSummary: 800,
  publicationTitle: 300,
  publisher: 200,
  publicationSummary: 800,
  volunteerRole: 200,
  volunteerSummary: 800,
  testimonialQuote: 1200,
  testimonialAuthor: 160,
  interest: 80,
  caption: 300,
  altText: 300,
  attachmentLabel: 160,
  fileName: 260,
  contentType: 120,
  projectRole: 160,
  projectSlug: 80,
  pageDescription: 320,
  passwordHash: 255,
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
  socialLinks: 16,
  softSkills: 40,
  courses: 60,
  publications: 40,
  volunteering: 30,
  testimonials: 20,
  interests: 30,
  gallery: 60,
  attachments: 20,
  projectContentBlocks: 20,
} as const;

/** Section kinds the renderer knows how to draw. Adding one is a schema change. */
export const SECTION_TYPES = [
  'hero',
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
  'contact',
  'custom',
] as const;

/**
 * How well someone knows a thing, as tiers rather than a percentage.
 *
 * A skill bar that says "TypeScript 87%" is a number nobody can defend and no
 * reader can act on. A tier says what the claim actually is: what I use daily,
 * what I have shipped, what I have touched, what I have read about.
 */
export const SKILL_TIERS = ['primary', 'strong', 'working', 'foundational'] as const;

/**
 * The social platforms a portfolio can link to.
 *
 * A closed set, because each one renders with its own mark and its own
 * accessible name. An unknown kind would render as an unlabelled icon, which is
 * worse than not rendering at all — so anything not on this list belongs in the
 * general links collection instead.
 */
export const SOCIAL_LINK_KINDS = [
  'github',
  'gitlab',
  'linkedin',
  'behance',
  'dribbble',
  'youtube',
  'tiktok',
  'instagram',
  'facebook',
  'x',
  'threads',
  'medium',
  'stackoverflow',
  'telegram',
  'whatsapp',
  'website',
  'mastodon',
  'bluesky',
] as const;

/** What a downloadable file on a portfolio is. */
export const ATTACHMENT_KINDS = [
  'cv',
  'cover-letter',
  'certificate',
  'portfolio',
  'reference',
  'other',
] as const;

/**
 * Who can read a page.
 *
 * `private` is not "hidden": a hidden page 404s for everyone. A private page
 * is reachable by anyone holding the password its owner set, and is excluded
 * from the sitemap, from RSS and from indexing — because the whole point is to
 * share it with a named person rather than with a crawler.
 */
export const PAGE_VISIBILITIES = ['public', 'private'] as const;

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
    config: { title: null, showEmail: true, showPhone: true, showLinks: true },
  },
] as const;
