/**
 * Stricter than the user-facing floor (`AUTH_MIN_PASSWORD_LENGTH = 12`):
 * these accounts can suspend, delete and reset other people's accounts.
 */
export const ADMIN_AUTH_MIN_PASSWORD_LENGTH = 16;

/** Matches better-auth's own default `emailAndPassword.maxPasswordLength` — never overridden in `createAdminAuth`. */
export const ADMIN_AUTH_MAX_PASSWORD_LENGTH = 128;

/** Twelve hours, not the user session's thirty days — force re-auth on a human timescale. */
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

/** Mounted by `src/app/api/managawy-auth/[...all]/route.ts`. */
export const ADMIN_AUTH_API_BASE_PATH = '/api/managawy-auth';

/** better-auth's own default cookie name is `better-auth.session_token`; this must differ. */
export const ADMIN_AUTH_COOKIE_PREFIX = 'managawy';
