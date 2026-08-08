export const DELETION_FAILURES = {
  notFound: 'not-found',
  confirmationMismatch: 'confirmation-mismatch',
} as const;

/**
 * What the user must type to delete their account.
 *
 * A typed confirmation rather than a second "are you sure" button. The second
 * button is muscle memory by the time anyone reaches it; typing a word is the
 * cheapest interruption that actually requires reading the sentence above it.
 * The word is a translation key's value, not this constant, so it can be the
 * right word in the reader's language — this is the fallback.
 */
export const ACCOUNT_DELETE_CONFIRMATION = 'DELETE';

export const ACCOUNT_ERROR_KEYS = {
  deleteFailed: 'errors.deleteFailed',
  confirmationMismatch: 'errors.confirmationMismatch',
  notFound: 'errors.notFound',
} as const;

export const ACCOUNT_INITIAL_STATE = { status: 'idle', error: null } as const;
