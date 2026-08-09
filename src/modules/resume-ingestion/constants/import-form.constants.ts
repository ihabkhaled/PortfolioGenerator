import type { ImportFormState } from '../types/import-form.types';

export const IMPORT_INITIAL_STATE: ImportFormState = {
  status: 'idle',
  error: null,
  warnings: [],
};

/**
 * Rejection reasons mapped to message keys.
 *
 * Every reason gets its own message. "Upload failed" tells a user nothing they
 * can act on; "this file is password-protected" tells them exactly what to do
 * next, and that difference is most of the support load for this feature.
 */
export const IMPORT_REJECTION_KEYS = {
  empty: 'errors.empty',
  'too-large': 'errors.tooLarge',
  'not-a-pdf': 'errors.notAPdf',
  encrypted: 'errors.encrypted',
  'too-many-pages': 'errors.tooManyPages',
  'quota-exceeded': 'errors.quotaExceeded',
  'rate-limited': 'errors.rateLimited',
  'type-mismatch': 'errors.typeMismatch',
  infected: 'errors.infected',
  'scanner-unavailable': 'errors.scannerUnavailable',
  scanned: 'errors.scanned',
  invalid: 'errors.invalid',
  notFound: 'errors.notFound',
  conflict: 'errors.conflict',
} as const;

/** Client-side hint only; the server re-checks the real bytes. */
export const ACCEPTED_UPLOAD_MIME = 'application/pdf';
