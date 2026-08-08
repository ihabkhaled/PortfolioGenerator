import { z, type ZodType } from '@/packages/zod';
import { CONTROL_CHARACTER_GLOBAL_PATTERN } from '@/shared/constants/text.constants';
import { normalizeSafeUrl } from '@/shared/utils/safe-url.util';
import { hasValidSlugShape } from '@/shared/utils/slug-shape.util';

import {
  DOCUMENT_COUNTS,
  DOCUMENT_LIMITS,
  HOME_PAGE_SLUG,
  MONTH_PATTERN,
  PORTFOLIO_SCHEMA_VERSION,
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
  .transform((value) => normalizeSafeUrl(value) ?? value);

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
});

const highlightText = boundedText(DOCUMENT_LIMITS.highlight);
const technologyText = boundedText(DOCUMENT_LIMITS.technology);

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
  name: requiredText(DOCUMENT_LIMITS.projectName),
  summary: boundedText(DOCUMENT_LIMITS.projectSummary).nullable(),
  highlights: boundedArray(highlightText, DOCUMENT_COUNTS.projectHighlights),
  technologies: boundedArray(technologyText, DOCUMENT_COUNTS.technologies),
  links: boundedArray(linkSchema, DOCUMENT_COUNTS.projectLinks),
});

export const skillGroupSchema = z.object({
  id: identifier,
  label: requiredText(DOCUMENT_LIMITS.skillGroupLabel),
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
  educationSectionSchema,
  certificationsSectionSchema,
  languagesSectionSchema,
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
    }),
  title: requiredText(DOCUMENT_LIMITS.pageTitle),
  navLabel: requiredText(DOCUMENT_LIMITS.navLabel),
  visible: z.boolean(),
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

const contactSchema = z.object({ email: contactFieldSchema, phone: contactFieldSchema });

function hasDuplicates(values: readonly string[]): boolean {
  return new Set(values).size !== values.length;
}

const documentShapeSchema = z.object({
  schemaVersion: z.literal(PORTFOLIO_SCHEMA_VERSION),
  identity: identitySchema,
  contact: contactSchema,
  links: boundedArray(linkSchema, DOCUMENT_COUNTS.links),
  experience: boundedArray(experienceSchema, DOCUMENT_COUNTS.experience),
  projects: boundedArray(projectSchema, DOCUMENT_COUNTS.projects),
  skills: boundedArray(skillGroupSchema, DOCUMENT_COUNTS.skillGroups),
  education: boundedArray(educationSchema, DOCUMENT_COUNTS.education),
  certifications: boundedArray(certificationSchema, DOCUMENT_COUNTS.certifications),
  languages: boundedArray(languageSchema, DOCUMENT_COUNTS.languages),
  awards: boundedArray(awardSchema, DOCUMENT_COUNTS.awards),
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
  }
});
