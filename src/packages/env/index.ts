/**
 * Client-safe environment facade.
 *
 * Only `NEXT_PUBLIC_*` values live here. They are read through explicit
 * property access rather than a loop because Next.js inlines
 * `process.env.NEXT_PUBLIC_X` at build time only when it sees the literal
 * expression — a dynamic lookup would silently produce `undefined` in the
 * browser bundle, and the failure would surface as localhost URLs in a
 * production sitemap rather than as an error.
 */

import { formatIssues, parseSchema } from '@/packages/zod';

import { publicEnvSchema } from './env.schema';

const parsed = parseSchema(publicEnvSchema, {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV ?? 'local',
});

if (!parsed.ok) {
  throw new Error(`Invalid public environment: ${formatIssues(parsed.issues)}`);
}

export const publicEnv = parsed.value;

/**
 * A trailing slash on the configured origin would produce `//path` in every
 * canonical URL and sitemap entry. Trimmed with a loop rather than an anchored
 * `/\/+$/` because that pattern backtracks super-linearly on adversarial input.
 */
function trimTrailingSlashes(value: string): string {
  let end = value.length;

  while (end > 0 && value[end - 1] === '/') {
    end -= 1;
  }

  return value.slice(0, end);
}

/** Absolute origin used for canonical URLs, sitemap entries and OG images. */
export const appOrigin = trimTrailingSlashes(publicEnv.NEXT_PUBLIC_APP_URL);

export function absoluteUrl(path: string): string {
  const absolutePath = path.startsWith('/') ? path : `/${path}`;

  return `${appOrigin}${absolutePath}`;
}
