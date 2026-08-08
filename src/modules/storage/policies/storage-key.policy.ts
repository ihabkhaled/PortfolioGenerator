import { STORAGE_KEY_PATTERN, STORAGE_KEY_RANDOM_BYTES } from '../constants/storage.constants';

/**
 * Object keys are generated, never chosen.
 *
 * A user-supplied filename in a storage key is a path-traversal bug and a
 * guessability problem at once. Keys here are `{ownerId}/{prefix}/{random}`:
 * the owner segment makes bulk deletion on account closure a prefix operation,
 * and the random segment makes a key unguessable even to someone who knows the
 * owner id.
 *
 * The original filename is kept in the database as metadata, where it is only
 * ever rendered as text.
 */

export function buildStorageKey(ownerId: string, prefix: string, randomToken: string): string {
  return `${sanitizeSegment(ownerId)}/${sanitizeSegment(prefix)}/${sanitizeSegment(randomToken)}`;
}

/**
 * Reduce a segment to the safe alphabet. This is defence in depth: every
 * caller passes an id or a generated token already, so a segment that changes
 * shape here means a caller is doing something it should not.
 */
export function sanitizeSegment(segment: string): string {
  return segment.replaceAll(/[^\w-]/gu, '');
}

/**
 * Reject any key that did not come from `buildStorageKey`.
 *
 * The storage adapters call this before touching the filesystem or signing a
 * request, so a key read back from a database row that someone tampered with
 * cannot escape the storage root.
 */
export function isValidStorageKey(key: string): boolean {
  return STORAGE_KEY_PATTERN.test(key);
}

export function randomTokenLength(): number {
  return STORAGE_KEY_RANDOM_BYTES * 2;
}
