/** 16 bytes of crypto randomness, hex-encoded: unguessable, and short enough to log. */
export const STORAGE_KEY_RANDOM_BYTES = 16;

/**
 * Exactly three segments of the safe alphabet, nothing else.
 *
 * Anchored and without nested quantifiers, so it cannot be made to backtrack,
 * and strict enough that `..`, `/`, `\`, a leading slash, and every
 * percent-encoded variant of them all fail.
 */
export const STORAGE_KEY_PATTERN = /^[\w-]+\/[\w-]+\/[\w-]+$/u;

export const RESUME_KEY_PREFIX = 'resumes';
export const ASSET_KEY_PREFIX = 'assets';
export const EXTRACTED_TEXT_KEY_PREFIX = 'extracted-text';

/** Content type stored for uploaded CVs; the browser's claim is never trusted. */
export const PDF_CONTENT_TYPE = 'application/pdf';
export const TEXT_CONTENT_TYPE = 'text/plain; charset=utf-8';
