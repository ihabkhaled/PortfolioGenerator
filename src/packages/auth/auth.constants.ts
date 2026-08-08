/**
 * A 12-character floor rather than the common 8: the accounts here hold
 * private CVs, and the cost of the stricter rule is one extra word.
 */
export const AUTH_MIN_PASSWORD_LENGTH = 12;

export const AUTH_MAX_PASSWORD_LENGTH = 128;

/** Thirty days, refreshed at a quarter of that so active users stay signed in. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/** Mounted by `src/app/api/auth/[...all]/route.ts`. */
export const AUTH_API_BASE_PATH = '/api/auth';
