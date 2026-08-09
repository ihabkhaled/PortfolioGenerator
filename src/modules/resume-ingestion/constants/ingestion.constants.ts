/** `/Encrypt` — the trailer entry that marks a password-protected PDF. */
export const ENCRYPTED_PDF_MARKER = [0x2f, 0x45, 0x6e, 0x63, 0x72, 0x79, 0x70, 0x74] as const;

/**
 * How far into the file to look for the `%PDF-` header.
 *
 * Bounded so a hostile 8 MB upload cannot turn signature checking into a full
 * scan; 1 KB is far beyond any legitimate leading junk.
 */
export const PDF_HEADER_SEARCH_WINDOW = 1024;

/**
 * Below this many characters per page, the document is almost certainly a scan.
 *
 * Chosen conservatively: a genuinely sparse text-layer CV (a one-page design
 * portfolio) should be told "this looks scanned" rather than silently sent to
 * a model that will produce nothing.
 */
export const SCANNED_CHARACTERS_PER_PAGE_THRESHOLD = 120;

/** Ingestion states, mirroring the `ResumeUploadStatus` enum in the schema. */
export const INGESTION_STATES = [
  'UPLOADED',
  'VALIDATED',
  'TEXT_EXTRACTED',
  'AI_STRUCTURING',
  'NEEDS_REVIEW',
  'READY',
  'FAILED_VALIDATION',
  'FAILED_TEXT_EXTRACTION',
  'FAILED_AI',
] as const;

/**
 * The only transitions the pipeline may make.
 *
 * Written as data rather than as `if` statements in the service so that the
 * legal shape of the pipeline can be read — and tested — in one place. A
 * refresh mid-import lands on a persisted state, so an impossible transition
 * would be a stuck upload nobody can explain.
 */
export const INGESTION_TRANSITIONS: Readonly<Record<string, readonly string[]>> = {
  UPLOADED: ['VALIDATED', 'FAILED_VALIDATION'],
  VALIDATED: ['TEXT_EXTRACTED', 'FAILED_TEXT_EXTRACTION'],
  TEXT_EXTRACTED: ['AI_STRUCTURING', 'FAILED_AI'],
  AI_STRUCTURING: ['NEEDS_REVIEW', 'READY', 'FAILED_AI'],
  NEEDS_REVIEW: ['READY'],
  READY: [],
  FAILED_VALIDATION: [],
  FAILED_TEXT_EXTRACTION: [],
  FAILED_AI: ['AI_STRUCTURING'],
};

/** Machine-readable rejection reasons, mapped to copy by the UI. */
export const UPLOAD_REJECTIONS = [
  'empty',
  'too-large',
  'not-a-pdf',
  'encrypted',
  'too-many-pages',
  'quota-exceeded',
  'rate-limited',
  // The file is not what its name and its content type claim it is.
  'type-mismatch',
  // Something was found in it.
  'infected',
  // The scanner could not answer, so nothing was stored. Deliberately distinct
  // from 'infected': one means the file is dangerous, the other means we do not
  // know, and a user who is told the wrong one cannot act correctly.
  'scanner-unavailable',
] as const;
