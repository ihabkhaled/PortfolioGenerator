/**
 * Public surface of the auth wrapper. Server code imports `./server`
 * explicitly so the `server-only` guard keeps the secret out of client
 * bundles; this barrel exposes only what is safe everywhere.
 */

export {
  AUTH_API_BASE_PATH,
  AUTH_MAX_PASSWORD_LENGTH,
  AUTH_MIN_PASSWORD_LENGTH,
  SESSION_MAX_AGE_SECONDS,
} from './auth.constants';
export type { AuthenticatedUser } from './auth.types';
