/**
 * Bounds on what the model may return.
 *
 * These are cost and safety limits at once. Every bound is enforced on output
 * as well as declared in the schema sent to the provider, because a schema is a
 * request and validation is a guarantee.
 */
export const EXTRACTION_LIMITS = {
  shortText: 320,
  longText: 2000,
  month: 20,
  url: 2048,
  listItems: 20,
  tags: 60,
  links: 20,
  experience: 40,
  projects: 50,
  skills: 300,
  softSkills: 40,
  education: 30,
  courses: 60,
  certifications: 50,
  languages: 30,
  awards: 50,
  publications: 40,
  volunteering: 30,
  interests: 30,
  warnings: 100,
} as const;

/** Named operations, so `ai_runs` can be grouped without parsing free text. */
export const AI_OPERATIONS = {
  extractResume: 'extract-resume',
  repairFragment: 'repair-fragment',
} as const;

/**
 * How many times the pipeline may go back to a model for one import.
 *
 * One primary call, one targeted repair, one fallback escalation. Beyond that
 * the answer is "show the user what we have and let them fix it" — a fourth
 * attempt has never been observed to help, and it is billed every time.
 */
export const MAX_EXTRACTION_ATTEMPTS = 3;

/** Warning codes the editor knows how to explain next to a field. */
export const WARNING_CODES = {
  ambiguousDate: 'AMBIGUOUS_DATE',
  unverifiedUrl: 'UNVERIFIED_URL',
  scannedDocument: 'SCANNED_DOCUMENT',
  truncatedInput: 'TRUNCATED_INPUT',
  droppedInvalidUrl: 'DROPPED_INVALID_URL',
  droppedIncompleteEntry: 'DROPPED_INCOMPLETE_ENTRY',
  missingHeadline: 'MISSING_HEADLINE',
  reviewExtractedFact: 'REVIEW_EXTRACTED_FACT',
} as const;
