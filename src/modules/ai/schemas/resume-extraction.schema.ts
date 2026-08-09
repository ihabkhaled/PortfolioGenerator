import { z } from '@/packages/zod';

import { EXTRACTION_LIMITS } from '../constants/extraction.constants';

/**
 * What the model is asked to return.
 *
 * Deliberately looser than `PortfolioDocument`: every field is nullable, ids
 * are absent, and nothing is required. The model's job is to report what the
 * CV says, not to produce a valid portfolio — assigning ids, applying
 * defaults and enforcing document invariants is the mapper's job, where it can
 * be tested without a model.
 *
 * Making extraction output nullable everywhere is also the mechanism behind the
 * no-invention rule: the model always has a legal way to say "not present", so
 * it never has to choose between guessing and failing schema validation.
 */

const shortText = z.string().max(EXTRACTION_LIMITS.shortText).nullable();
const longText = z.string().max(EXTRACTION_LIMITS.longText).nullable();
const month = z.string().max(EXTRACTION_LIMITS.month).nullable();

export const extractedLinkSchema = z.object({
  kind: z.string().max(EXTRACTION_LIMITS.shortText),
  url: z.string().max(EXTRACTION_LIMITS.url),
});

export const extractedExperienceSchema = z.object({
  organization: shortText,
  title: shortText,
  location: shortText,
  startDate: month,
  endDate: month,
  current: z.boolean(),
  summary: longText,
  highlights: z.array(z.string().max(EXTRACTION_LIMITS.longText)).max(EXTRACTION_LIMITS.listItems),
  technologies: z.array(z.string().max(EXTRACTION_LIMITS.shortText)).max(EXTRACTION_LIMITS.tags),
});

export const extractedProjectSchema = z.object({
  name: shortText,
  summary: longText,
  highlights: z.array(z.string().max(EXTRACTION_LIMITS.longText)).max(EXTRACTION_LIMITS.listItems),
  technologies: z.array(z.string().max(EXTRACTION_LIMITS.shortText)).max(EXTRACTION_LIMITS.tags),
  url: z.string().max(EXTRACTION_LIMITS.url).nullable(),
});

export const extractedEducationSchema = z.object({
  institution: shortText,
  degree: shortText,
  field: shortText,
  startDate: month,
  endDate: month,
  location: shortText,
  details: longText,
});

export const extractedCertificationSchema = z.object({
  name: shortText,
  issuer: shortText,
  date: month,
  credentialUrl: z.string().max(EXTRACTION_LIMITS.url).nullable(),
});

export const extractedSoftSkillSchema = z.object({
  label: shortText,
  detail: longText,
});

export const extractedCourseSchema = z.object({
  name: shortText,
  provider: shortText,
  date: month,
  url: z.string().max(EXTRACTION_LIMITS.url).nullable(),
  summary: longText,
});

export const extractedLanguageSchema = z.object({
  name: shortText,
  proficiency: shortText,
});

export const extractedAwardSchema = z.object({
  name: shortText,
  issuer: shortText,
  date: month,
  description: longText,
});

export const extractionWarningSchema = z.object({
  code: z.string().max(EXTRACTION_LIMITS.shortText),
  path: z.string().max(EXTRACTION_LIMITS.shortText),
  message: z.string().max(EXTRACTION_LIMITS.longText),
});

export const resumeExtractionSchema = z.object({
  identity: z.object({
    displayName: shortText,
    headline: shortText,
    summary: longText,
    location: shortText,
    tagline: shortText.optional(),
    coverLetter: longText.optional(),
    availabilityEnabled: z.boolean().nullable().optional(),
    availabilityNote: shortText.optional(),
  }),
  contact: z.object({
    email: shortText,
    phone: shortText,
  }),
  links: z.array(extractedLinkSchema).max(EXTRACTION_LIMITS.links),
  experience: z.array(extractedExperienceSchema).max(EXTRACTION_LIMITS.experience),
  projects: z.array(extractedProjectSchema).max(EXTRACTION_LIMITS.projects),
  skills: z.array(z.string().max(EXTRACTION_LIMITS.shortText)).max(EXTRACTION_LIMITS.skills),
  softSkills: z.array(extractedSoftSkillSchema).max(EXTRACTION_LIMITS.softSkills),
  education: z.array(extractedEducationSchema).max(EXTRACTION_LIMITS.education),
  courses: z.array(extractedCourseSchema).max(EXTRACTION_LIMITS.courses),
  certifications: z.array(extractedCertificationSchema).max(EXTRACTION_LIMITS.certifications),
  languages: z.array(extractedLanguageSchema).max(EXTRACTION_LIMITS.languages),
  awards: z.array(extractedAwardSchema).max(EXTRACTION_LIMITS.awards),
  warnings: z.array(extractionWarningSchema).max(EXTRACTION_LIMITS.warnings),
});
