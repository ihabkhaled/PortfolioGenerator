import type { EditorActionState } from '../types/editor.types';

export const EDITOR_INITIAL_STATE: EditorActionState = {
  status: 'idle',
  error: null,
  version: null,
};

/**
 * Failure keys, one per reason.
 *
 * `versionConflict` in particular gets its own message because the recovery is
 * specific and non-obvious: reload, because someone (often the same person in
 * another tab) already changed this.
 */
export const EDITOR_ERROR_KEYS = {
  invalidDocument: 'errors.invalidDocument',
  versionConflict: 'errors.versionConflict',
  'not-found': 'errors.notFound',
  notFound: 'errors.notFound',
  'not-ready': 'errors.notReady',
  'slug-taken': 'errors.slugTaken',
  'invalid-slug': 'errors.invalidSlug',
  invalidSlug: 'errors.invalidSlug',
  'invalid-document': 'errors.invalidDocument',
} as const;

/** Debounce for the slug availability check, in milliseconds. */
export const SLUG_CHECK_DEBOUNCE_MS = 400;
