import { MARKETING_ROUTE_PATHS, ROUTE_PATHS } from '@/shared/constants/route-paths.constants';
import { compareAlphabetically } from '@/shared/utils/text.util';

export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 48;

/**
 * The first path segment of every platform route.
 *
 * Derived rather than hand-listed: a portfolio published at `/dashboard` would
 * be unreachable at best and a phishing surface at worst, and the only way to
 * keep that guarantee true as routes are added is to compute the denylist from
 * the route table itself.
 */
const PLATFORM_ROUTE_SEGMENTS = Object.values({ ...ROUTE_PATHS, ...MARKETING_ROUTE_PATHS })
  .map((path) => path.split('/').find(Boolean))
  .filter((segment): segment is string => Boolean(segment));

/**
 * Words that are not routes today but must never become a tenant's identity:
 * well-known paths browsers and crawlers probe, words that would let a
 * portfolio impersonate the platform, and the file names a static host serves
 * from the root.
 */
const DEFENSIVE_RESERVED_SEGMENTS = [
  'about',
  'account',
  'admin',
  'administrator',
  'assets',
  'auth',
  'billing',
  'blog',
  'cdn',
  'contact',
  'cookies',
  'css',
  'docs',
  'favicon.ico',
  'fonts',
  'help',
  'images',
  'img',
  'js',
  'legal',
  'login',
  'logout',
  'mail',
  'new',
  'null',
  'oauth',
  'portfolio',
  'preview',
  'pricing',
  'privacy',
  'public',
  'register',
  'root',
  'security',
  'settings',
  'signin',
  'signup',
  'static',
  'status',
  'support',
  'system',
  'terms',
  'undefined',
  'user',
  'users',
  'well-known',
  'www',
] as const;

export const RESERVED_SLUG_SEGMENTS: readonly string[] = [
  ...new Set([...PLATFORM_ROUTE_SEGMENTS, ...DEFENSIVE_RESERVED_SEGMENTS]),
].toSorted(compareAlphabetically);

/** Machine-readable reasons so the UI can show a specific message per failure. */
export const SLUG_REJECTION_REASONS = {
  empty: 'empty',
  tooShort: 'too-short',
  tooLong: 'too-long',
  invalidCharacters: 'invalid-characters',
  reserved: 'reserved',
} as const;
