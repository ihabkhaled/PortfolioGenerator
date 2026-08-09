import { z, type ZodType } from '@/packages/zod';
import { PORTFOLIO_SUBPATH_SEGMENTS } from '@/shared/constants/route-paths.constants';
import { CONTROL_CHARACTER_GLOBAL_PATTERN } from '@/shared/constants/text.constants';
import { normalizeSafeUrl } from '@/shared/utils/safe-url.util';
import { hasValidSlugShape } from '@/shared/utils/slug-shape.util';

import {
  ATTACHMENT_KINDS,
  DOCUMENT_COUNTS,
  DOCUMENT_LIMITS,
  HOME_PAGE_SLUG,
  MONTH_PATTERN,
  PAGE_VISIBILITIES,
  PORTFOLIO_SCHEMA_VERSION,
  SKILL_TIERS,
  SOCIAL_LINK_KINDS,
  SOURCE_KINDS,
  THEME_ACCENTS,
  THEME_MODES,
} from '../constants/portfolio-document.constants';

/**
 * The canonical PortfolioDocument.
 *
 * This schema is the product's contract with itself. Nothing reads stored JSON
 * without passing through it, which is what makes three separate guarantees
 * hold at once:
 *
 *   - model output is data, not trust: an extraction result becomes a document
 *     only after full validation;
 *   - a published page cannot contain an unrenderable or unsafe value, because
 *     publishing re-validates the whole document;
 *   - schema evolution is explicit: `schemaVersion` plus a migration step, not
 *     defensive `?.` chains scattered through the renderer.
 *
 * Every field is required and nullable rather than optional. A missing key and
 * an empty value are the same fact to a reader, and modelling them as one
 * removes an entire class of "sometimes undefined" bugs from the editor.
 */

const identifier = z.string().min(1).max(DOCUMENT_LIMITS.id);
const month = z.string().regex(MONTH_PATTERN).nullable();

/**
 * Text that will be rendered.
 *
 * Control characters are stripped rather than escaped: they carry no meaning in
 * a CV, and they are the raw material for bidirectional-override and zero-width
 * tricks that make a rendered name read as something other than what is stored.
 * React escapes markup on output, so this is defence in depth, not the only
 * defence.
 */
function boundedText(max: number) {
  return z
    .string()
    .max(max)
    .transform((value) => value.replaceAll(CONTROL_CHARACTER_GLOBAL_PATTERN, ''));
}

function requiredText(max: number) {
  return boundedText(max).refine((value) => value.trim().length > 0, {
    message: 'Value must not be empty',
  });
}

/** Named so array bounds read as one call rather than a three-deep chain. */
function boundedArray<TItem extends ZodType>(item: TItem, max: number) {
  return z.array(item).max(max);
}

const safeUrl = z
  .string()
  .max(DOCUMENT_LIMITS.url)
  .refine((value) => normalizeSafeUrl(value) !== null, {
    message: 'Only https: and mailto: URLs can be published',
  })
  .transform((value) => {
    /* v8 ignore next -- the refine above rejects anything normalizeSafeUrl would refuse. */
    return normalizeSafeUrl(value) ?? value;
  });

export const linkSchema = z.object({
  id: identifier,
  kind: requiredText(DOCUMENT_LIMITS.linkKind),
  label: requiredText(DOCUMENT_LIMITS.linkLabel),
  url: safeUrl,
  visible: z.boolean(),
});

const contactFieldSchema = z.object({
  value: boundedText(DOCUMENT_LIMITS.email).nullable(),
  visible: z.boolean(),
});

const identitySchema = z.object({
  displayName: requiredText(DOCUMENT_LIMITS.displayName),
  // Nullable because a draft is a real document: a portfolio created from
  // the manual path has no headline yet, and forcing a placeholder would put
  // a word nobody chose on a page someone might publish. Publishing is where
  // a headline becomes required.
  headline: boundedText(DOCUMENT_LIMITS.headline).nullable(),
  summary: boundedText(DOCUMENT_LIMITS.summary).nullable(),
  location: boundedText(DOCUMENT_LIMITS.location).nullable(),
  portraitAssetId: z.string().max(DOCUMENT_LIMITS.assetId).nullable(),
  availabilityEnabled: z.boolean(),
  /** One line under the headline — what the person is looking for right now. */
  tagline: boundedText(DOCUMENT_LIMITS.tagline).nullable(),
  /** Shown next to the availability badge: "open to contract work from May". */
  availabilityNote: boundedText(DOCUMENT_LIMITS.availabilityNote).nullable(),
  /**
   * A letter, not a bio. Long-form, addressed to a reader, and rendered on its
   * own page rather than on the masthead — which is why it is bounded far
   * higher than the summary and never appears in a meta description.
   */
  coverLetter: boundedText(DOCUMENT_LIMITS.coverLetter).nullable(),
});

const highlightText = boundedText(DOCUMENT_LIMITS.highlight);
const technologyText = boundedText(DOCUMENT_LIMITS.technology);

const sectionTitle = boundedText(DOCUMENT_LIMITS.sectionTitle).nullable();
const collectionLimit = z.number().int().min(1).max(100).nullable();

const statItemSchema = z.object({
  id: identifier,
  label: requiredText(DOCUMENT_LIMITS.statLabel),
  value: requiredText(DOCUMENT_LIMITS.statValue),
});

const paragraphBlockSchema = z.object({
  id: identifier,
  kind: z.literal('paragraph'),
  text: boundedText(DOCUMENT_LIMITS.blockText),
});

const bulletListBlockSchema = z.object({
  id: identifier,
  kind: z.literal('bullet-list'),
  items: boundedArray(boundedText(DOCUMENT_LIMITS.blockItem), DOCUMENT_COUNTS.itemsPerBlock),
});

const statListBlockSchema = z.object({
  id: identifier,
  kind: z.literal('stat-list'),
  items: boundedArray(statItemSchema, DOCUMENT_COUNTS.itemsPerBlock),
});

const linksBlockSchema = z.object({
  id: identifier,
  kind: z.literal('links'),
  items: boundedArray(linkSchema, DOCUMENT_COUNTS.itemsPerBlock),
});

/**
 * The complete vocabulary a user can put in a custom section. There is no
 * escape hatch by design: no HTML, no markdown that renders HTML, no embed, no
 * style. Extending expressiveness means adding a block kind here and a renderer
 * for it, which is a reviewed change rather than a runtime surprise.
 */
export const customBlockSchema = z.discriminatedUnion('kind', [
  paragraphBlockSchema,
  bulletListBlockSchema,
  statListBlockSchema,
  linksBlockSchema,
]);

export const experienceSchema = z.object({
  id: identifier,
  organization: requiredText(DOCUMENT_LIMITS.organization),
  title: requiredText(DOCUMENT_LIMITS.jobTitle),
  location: boundedText(DOCUMENT_LIMITS.location).nullable(),
  startDate: month,
  endDate: month,
  current: z.boolean(),
  summary: boundedText(DOCUMENT_LIMITS.roleSummary).nullable(),
  highlights: boundedArray(highlightText, DOCUMENT_COUNTS.experienceHighlights),
  technologies: boundedArray(technologyText, DOCUMENT_COUNTS.technologies),
});

export const projectSchema = z.object({
  id: identifier,
  /**
   * The URL segment of the project's own page, when it has one. Optional by
   * design: a project worth one card is not always worth a page, and forcing a
   * slug would fill the sitemap with thin pages.
   */
  slug: z
    .string()
    .max(DOCUMENT_LIMITS.projectSlug)
    .refine((value) => hasValidSlugShape(value), {
      message: 'Project slug must be lowercase words separated by single hyphens',
    })
    .nullable(),
  name: requiredText(DOCUMENT_LIMITS.projectName),
  role: boundedText(DOCUMENT_LIMITS.projectRole).nullable(),
  year: month,
  coverAssetId: z.string().max(DOCUMENT_LIMITS.assetId).nullable(),
  featured: z.boolean(),
  summary: boundedText(DOCUMENT_LIMITS.projectSummary).nullable(),
  highlights: boundedArray(highlightText, DOCUMENT_COUNTS.projectHighlights),
  technologies: boundedArray(technologyText, DOCUMENT_COUNTS.technologies),
  links: boundedArray(linkSchema, DOCUMENT_COUNTS.projectLinks),
  /** Long-form content for the project's own page, in the bounded vocabulary. */
  content: boundedArray(customBlockSchema, DOCUMENT_COUNTS.projectContentBlocks),
});

export const skillGroupSchema = z.object({
  id: identifier,
  label: requiredText(DOCUMENT_LIMITS.skillGroupLabel),
  /**
   * What the group claims. Tiers rather than a percentage: "TypeScript 87%" is
   * a number nobody can defend and no reader can act on, while "I use this
   * daily without reference material" is a claim someone can interview against.
   */
  tier: z.enum(SKILL_TIERS),
  items: boundedArray(requiredText(DOCUMENT_LIMITS.skillItem), DOCUMENT_COUNTS.skillItems),
});

export const educationSchema = z.object({
  id: identifier,
  institution: requiredText(DOCUMENT_LIMITS.institution),
  degree: boundedText(DOCUMENT_LIMITS.degree).nullable(),
  field: boundedText(DOCUMENT_LIMITS.field).nullable(),
  startDate: month,
  endDate: month,
  location: boundedText(DOCUMENT_LIMITS.location).nullable(),
  details: boundedText(DOCUMENT_LIMITS.educationDetails).nullable(),
});

export const certificationSchema = z.object({
  id: identifier,
  name: requiredText(DOCUMENT_LIMITS.certificationName),
  issuer: boundedText(DOCUMENT_LIMITS.issuer).nullable(),
  date: month,
  credentialUrl: safeUrl.nullable(),
});

export const languageSchema = z.object({
  id: identifier,
  name: requiredText(DOCUMENT_LIMITS.languageName),
  proficiency: boundedText(DOCUMENT_LIMITS.proficiency).nullable(),
});

export const awardSchema = z.object({
  id: identifier,
  name: requiredText(DOCUMENT_LIMITS.awardName),
  issuer: boundedText(DOCUMENT_LIMITS.issuer).nullable(),
  date: month,
  description: boundedText(DOCUMENT_LIMITS.awardDescription).nullable(),
});


const sectionBase = {
  id: identifier,
  visible: z.boolean(),
  order: z.number().int().min(0).max(10_000),
};

const heroSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('hero'),
  config: z.object({ showPortrait: z.boolean(), showAvailability: z.boolean() }),
});

const titledConfig = z.object({ title: sectionTitle });
const limitedConfig = z.object({ title: sectionTitle, limit: collectionLimit });

const aboutSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('about'),
  config: titledConfig,
});

const experienceSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('experience'),
  config: limitedConfig,
});

const projectsSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('projects'),
  config: limitedConfig,
});

const skillsSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('skills'),
  config: titledConfig,
});

const educationSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('education'),
  config: titledConfig,
});

const certificationsSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('certifications'),
  config: titledConfig,
});

const languagesSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('languages'),
  config: titledConfig,
});

const softSkillsSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('soft-skills'),
  config: titledConfig,
});

const coursesSectionSchema = z.object({ ...sectionBase, type: z.literal('courses'), config: titledConfig });
const publicationsSectionSchema = z.object({ ...sectionBase, type: z.literal('publications'), config: titledConfig });
const volunteeringSectionSchema = z.object({ ...sectionBase, type: z.literal('volunteering'), config: titledConfig });
const awardsSectionSchema = z.object({ ...sectionBase, type: z.literal('awards'), config: titledConfig });
const interestsSectionSchema = z.object({ ...sectionBase, type: z.literal('interests'), config: titledConfig });
const testimonialsSectionSchema = z.object({ ...sectionBase, type: z.literal('testimonials'), config: titledConfig });
const gallerySectionSchema = z.object({ ...sectionBase, type: z.literal('gallery'), config: titledConfig });
const attachmentsSectionSchema = z.object({ ...sectionBase, type: z.literal('attachments'), config: titledConfig });
const socialSectionSchema = z.object({ ...sectionBase, type: z.literal('social'), config: titledConfig });

const contactSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('contact'),
  config: z.object({
    title: sectionTitle,
    showEmail: z.boolean(),
    showPhone: z.boolean(),
    showLinks: z.boolean(),
  }),
});

const customSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('custom'),
  config: z.object({
    title: sectionTitle,
    blocks: boundedArray(customBlockSchema, DOCUMENT_COUNTS.blocksPerCustomSection),
  }),
});

/**
 * Built-in sections reference the document's canonical collections instead of
 * copying content into the page. Two places holding the same fact is how an
 * editor ends up publishing a job title the user already corrected.
 */
export const sectionSchema = z.discriminatedUnion('type', [
  heroSectionSchema,
  aboutSectionSchema,
  experienceSectionSchema,
  projectsSectionSchema,
  skillsSectionSchema,
  softSkillsSectionSchema,
  educationSectionSchema,
  coursesSectionSchema,
  certificationsSectionSchema,
  languagesSectionSchema,
  publicationsSectionSchema,
  volunteeringSectionSchema,
  awardsSectionSchema,
  interestsSectionSchema,
  testimonialsSectionSchema,
  gallerySectionSchema,
  attachmentsSectionSchema,
  socialSectionSchema,
  contactSectionSchema,
  customSectionSchema,
]);

export const pageSchema = z.object({
  id: identifier,
  slug: z
    .string()
    .max(DOCUMENT_LIMITS.pageSlug)
    .refine((value) => value === HOME_PAGE_SLUG || hasValidSlugShape(value), {
      message: 'Page slug must be lowercase words separated by single hyphens',
    })
    // Shadowed by a platform handler on the same path; see PORTFOLIO_SUBPATH_SEGMENTS.
    .refine((value) => !PORTFOLIO_SUBPATH_SEGMENTS.includes(value), {
      message: 'Page slug is reserved by the platform',
    }),
  title: requiredText(DOCUMENT_LIMITS.pageTitle),
  navLabel: requiredText(DOCUMENT_LIMITS.navLabel),
  description: boundedText(DOCUMENT_LIMITS.pageDescription).nullable(),
  visible: z.boolean(),
  /**
   * Public or private. Private is not hidden: a hidden page 404s for everyone,
   * while a private page opens for anyone holding the password its owner set,
   * and never reaches a sitemap, an RSS feed or an index.
   */
  visibility: z.enum(PAGE_VISIBILITIES),
  /**
   * The share password, hashed. The plaintext never reaches the document — it
   * is set through an action that hashes it, and a document that could carry it
   * would put it in every backup and every audit trail.
   */
  passwordHash: z.string().max(DOCUMENT_LIMITS.passwordHash).nullable(),
  order: z.number().int().min(0).max(10_000),
  sections: boundedArray(sectionSchema, DOCUMENT_COUNTS.sectionsPerPage),
});

const themeSchema = z.object({
  templateId: requiredText(DOCUMENT_LIMITS.templateId),
  mode: z.enum(THEME_MODES),
  accent: z.enum(THEME_ACCENTS),
});

const seoSchema = z.object({
  title: boundedText(DOCUMENT_LIMITS.seoTitle).nullable(),
  description: boundedText(DOCUMENT_LIMITS.seoDescription).nullable(),
  indexable: z.boolean(),
});

const sourceSchema = z.object({
  kind: z.enum(SOURCE_KINDS),
  resumeUploadId: z.string().max(DOCUMENT_LIMITS.id).nullable(),
});

/**
 * A phone number, kept as the two things a person actually chose.
 *
 * The country is an ISO code rather than a dialling prefix, because `+1` is
 * the whole North American plan and `+7` covers two countries — the prefix
 * cannot answer "where are you". The number itself is stored exactly as typed:
 * spaces, dashes and parentheses are how people read their own numbers back.
 */
const phoneFieldSchema = z.object({
  countryIso: z
    .string()
    .length(DOCUMENT_LIMITS.countryIso)
    .regex(/^[A-Z]{2}$/u, 'Country must be an ISO 3166-1 alpha-2 code')
    .nullable(),
  nationalNumber: boundedText(DOCUMENT_LIMITS.nationalNumber).nullable(),
  visible: z.boolean(),
});

const contactSchema = z.object({ email: contactFieldSchema, phone: phoneFieldSchema });

/**
 * A profile on a named platform.
 *
 * Separate from the general links collection because these render as marks
 * rather than as text, and a mark needs a kind the renderer recognises. A
 * profile whose URL is absent is simply not in the array — the renderer never
 * has to decide whether to draw an icon that goes nowhere.
 */
export const socialLinkSchema = z.object({
  id: identifier,
  kind: z.enum(SOCIAL_LINK_KINDS),
  /** Overrides the platform name when someone wants "@handle" instead. */
  label: boundedText(DOCUMENT_LIMITS.linkLabel).nullable(),
  url: safeUrl,
  visible: z.boolean(),
});

export const softSkillSchema = z.object({
  id: identifier,
  label: requiredText(DOCUMENT_LIMITS.softSkill),
  /** A sentence of evidence. A soft skill asserted without one is a word. */
  detail: boundedText(DOCUMENT_LIMITS.softSkillDetail).nullable(),
});

export const courseSchema = z.object({
  id: identifier,
  name: requiredText(DOCUMENT_LIMITS.courseName),
  provider: boundedText(DOCUMENT_LIMITS.provider).nullable(),
  date: month,
  url: safeUrl.nullable(),
  summary: boundedText(DOCUMENT_LIMITS.courseSummary).nullable(),
});

export const publicationSchema = z.object({
  id: identifier,
  title: requiredText(DOCUMENT_LIMITS.publicationTitle),
  publisher: boundedText(DOCUMENT_LIMITS.publisher).nullable(),
  date: month,
  url: safeUrl.nullable(),
  summary: boundedText(DOCUMENT_LIMITS.publicationSummary).nullable(),
});

export const volunteeringSchema = z.object({
  id: identifier,
  organization: requiredText(DOCUMENT_LIMITS.organization),
  role: boundedText(DOCUMENT_LIMITS.volunteerRole).nullable(),
  startDate: month,
  endDate: month,
  summary: boundedText(DOCUMENT_LIMITS.volunteerSummary).nullable(),
});

export const testimonialSchema = z.object({
  id: identifier,
  quote: requiredText(DOCUMENT_LIMITS.testimonialQuote),
  author: requiredText(DOCUMENT_LIMITS.testimonialAuthor),
  role: boundedText(DOCUMENT_LIMITS.jobTitle).nullable(),
  organization: boundedText(DOCUMENT_LIMITS.organization).nullable(),
});

/**
 * One image in the gallery.
 *
 * `alt` is required and non-empty. A decorative image would not be in a
 * gallery, and an image on someone's professional page that a screen reader
 * announces as "image" is a gap in their portfolio, not in ours.
 */
export const galleryItemSchema = z.object({
  id: identifier,
  assetId: z.string().min(1).max(DOCUMENT_LIMITS.assetId),
  alt: requiredText(DOCUMENT_LIMITS.altText),
  caption: boundedText(DOCUMENT_LIMITS.caption).nullable(),
});

/**
 * A file a reader can download.
 *
 * The bytes live in private object storage and are served by a route that
 * checks the portfolio is published and the attachment is visible. The document
 * holds only what it takes to render the link and label it honestly — including
 * the size, because a reader on a phone deserves to know before they tap.
 */
export const attachmentSchema = z.object({
  id: identifier,
  kind: z.enum(ATTACHMENT_KINDS),
  label: requiredText(DOCUMENT_LIMITS.attachmentLabel),
  assetId: z.string().min(1).max(DOCUMENT_LIMITS.assetId),
  fileName: requiredText(DOCUMENT_LIMITS.fileName),
  contentType: requiredText(DOCUMENT_LIMITS.contentType),
  sizeBytes: z.number().int().min(0).max(100_000_000),
  visible: z.boolean(),
});

function hasDuplicates(values: readonly string[]): boolean {
  return new Set(values).size !== values.length;
}

const documentShapeSchema = z.object({
  schemaVersion: z.literal(PORTFOLIO_SCHEMA_VERSION),
  identity: identitySchema,
  contact: contactSchema,
  links: boundedArray(linkSchema, DOCUMENT_COUNTS.links),
  socialLinks: boundedArray(socialLinkSchema, DOCUMENT_COUNTS.socialLinks),
  experience: boundedArray(experienceSchema, DOCUMENT_COUNTS.experience),
  projects: boundedArray(projectSchema, DOCUMENT_COUNTS.projects),
  skills: boundedArray(skillGroupSchema, DOCUMENT_COUNTS.skillGroups),
  softSkills: boundedArray(softSkillSchema, DOCUMENT_COUNTS.softSkills),
  education: boundedArray(educationSchema, DOCUMENT_COUNTS.education),
  courses: boundedArray(courseSchema, DOCUMENT_COUNTS.courses),
  certifications: boundedArray(certificationSchema, DOCUMENT_COUNTS.certifications),
  languages: boundedArray(languageSchema, DOCUMENT_COUNTS.languages),
  awards: boundedArray(awardSchema, DOCUMENT_COUNTS.awards),
  publications: boundedArray(publicationSchema, DOCUMENT_COUNTS.publications),
  volunteering: boundedArray(volunteeringSchema, DOCUMENT_COUNTS.volunteering),
  testimonials: boundedArray(testimonialSchema, DOCUMENT_COUNTS.testimonials),
  interests: boundedArray(requiredText(DOCUMENT_LIMITS.interest), DOCUMENT_COUNTS.interests),
  gallery: boundedArray(galleryItemSchema, DOCUMENT_COUNTS.gallery),
  attachments: boundedArray(attachmentSchema, DOCUMENT_COUNTS.attachments),
  pages: z.array(pageSchema).min(1).max(DOCUMENT_COUNTS.pages),
  theme: themeSchema,
  seo: seoSchema,
  source: sourceSchema,
});

/**
 * Cross-field invariants the shape alone cannot express. Each one exists
 * because violating it produces a portfolio that cannot be routed: two pages
 * claiming the same URL, no page at the root, or two sections sharing a React
 * key.
 */
export const portfolioDocumentSchema = documentShapeSchema.superRefine((document, context) => {
  const homePages = document.pages.filter((page) => page.slug === HOME_PAGE_SLUG);

  if (homePages.length !== 1) {
    context.addIssue({
      code: 'custom',
      path: ['pages'],
      message: 'A portfolio must have exactly one home page with an empty slug',
    });
  }

  if (hasDuplicates(document.pages.map((page) => page.slug))) {
    context.addIssue({
      code: 'custom',
      path: ['pages'],
      message: 'Page slugs must be unique within a portfolio',
    });
  }

  if (hasDuplicates(document.pages.map((page) => page.id))) {
    context.addIssue({
      code: 'custom',
      path: ['pages'],
      message: 'Page ids must be unique',
    });
  }

  for (const [pageIndex, page] of document.pages.entries()) {
    if (hasDuplicates(page.sections.map((section) => section.id))) {
      context.addIssue({
        code: 'custom',
        path: ['pages', pageIndex, 'sections'],
        message: 'Section ids must be unique within a page',
      });
    }

    // A private home page would make the whole portfolio unreachable, which is
    // "unpublish" wearing a costume. Unpublishing is the control for that.
    if (page.slug === HOME_PAGE_SLUG && page.visibility === 'private') {
      context.addIssue({
        code: 'custom',
        path: ['pages', pageIndex, 'visibility'],
        message: 'The home page cannot be private; unpublish the portfolio instead',
      });
    }

    // A private page with no password is a public page that believes otherwise.
    if (page.visibility === 'private' && page.passwordHash === null) {
      context.addIssue({
        code: 'custom',
        path: ['pages', pageIndex, 'passwordHash'],
        message: 'A private page must have a share password set',
      });
    }
  }

  const projectSlugs = document.projects
    .map((project) => project.slug)
    .filter((slug): slug is string => slug !== null);

  if (hasDuplicates(projectSlugs)) {
    context.addIssue({
      code: 'custom',
      path: ['projects'],
      message: 'Project slugs must be unique within a portfolio',
    });
  }

  // A project page and a portfolio page would collide on the same URL segment.
  const pageSlugs = new Set(document.pages.map((page) => page.slug));
  const collision = projectSlugs.find((slug) => pageSlugs.has(slug));

  if (collision !== undefined) {
    context.addIssue({
      code: 'custom',
      path: ['projects'],
      message: `Project slug "${collision}" collides with a page of the same name`,
    });
  }

  if (hasDuplicates(document.socialLinks.map((link) => link.kind))) {
    context.addIssue({
      code: 'custom',
      path: ['socialLinks'],
      message: 'Each social platform can appear once',
    });
  }
});
