import { hasValidSlugShape } from '@/shared/utils/slug-shape.util';
import { trimCharacter } from '@/shared/utils/text.util';

import {
  RESERVED_SLUG_SEGMENTS,
  SLUG_MAX_LENGTH,
  SLUG_MIN_LENGTH,
  SLUG_REJECTION_REASONS,
} from '../constants/slug.constants';
import type { SlugValidation } from '../types/slug.types';

/**
 * The single source of truth for public slugs.
 *
 * A slug is simultaneously a URL path segment, a global unique key, and a
 * person's public identity. That combination is why normalization and
 * validation are separate functions here: `normalizeSlug` is a *suggestion*
 * engine used to turn a display name into a starting point, and `validateSlug`
 * is the gate. Suggestion never implies acceptance — the publish transaction
 * re-validates, and the database unique constraint decides the winner of a
 * race between two users typing the same slug.
 *
 * Unicode is transliterated to ASCII rather than percent-encoded. A portfolio
 * URL gets pasted into CVs, emails and chat clients; `%D8%A5%D9%8A%D9%87%D8%A7`
 * is not a professional identity, and mixed-script slugs are a homograph
 * problem waiting to happen.
 */

export function normalizeSlug(input: string): string {
  const ascii = input
    .normalize('NFKD')
    // Strip the combining marks NFKD leaves behind, so "José" becomes "jose".
    .replaceAll(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, '-')
    .replaceAll(/-{2,}/gu, '-');

  return trimCharacter(trimCharacter(ascii, '-').slice(0, SLUG_MAX_LENGTH), '-');
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUG_SEGMENTS.includes(slug);
}

/**
 * Validate a slug exactly as it was supplied. This deliberately does not
 * normalize: a user who typed `Jane Doe` is shown the corrected suggestion and
 * accepts it, rather than silently getting a URL they did not choose.
 */
export function validateSlug(candidate: string): SlugValidation {
  const slug = candidate.trim();

  if (slug.length === 0) {
    return { ok: false, reason: SLUG_REJECTION_REASONS.empty };
  }

  if (slug.length < SLUG_MIN_LENGTH) {
    return { ok: false, reason: SLUG_REJECTION_REASONS.tooShort };
  }

  if (slug.length > SLUG_MAX_LENGTH) {
    return { ok: false, reason: SLUG_REJECTION_REASONS.tooLong };
  }

  // The allowlist rejects `.`, `..`, `/`, `\`, `%2e%2e` and every other
  // traversal spelling at once, because none of them survive `[a-z0-9-]`.
  if (!hasValidSlugShape(slug)) {
    return { ok: false, reason: SLUG_REJECTION_REASONS.invalidCharacters };
  }

  if (isReservedSlug(slug)) {
    return { ok: false, reason: SLUG_REJECTION_REASONS.reserved };
  }

  return { ok: true, slug };
}

/**
 * Turn a display name into a valid starting suggestion, padding names that are
 * too short and escaping reserved words. Deterministic, so the same name always
 * suggests the same first candidate; availability is still the database's call.
 */
export function suggestSlug(displayName: string): string {
  const base = normalizeSlug(displayName);

  if (base.length === 0) {
    return 'portfolio-1';
  }

  const padded = base.length < SLUG_MIN_LENGTH ? `${base}-portfolio` : base;

  return isReservedSlug(padded) ? `${padded}-1` : padded;
}
