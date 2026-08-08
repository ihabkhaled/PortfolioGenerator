import 'server-only';

import { revalidatePath, revalidateTag, unstable_cache, updateTag } from 'next/cache';

import { PUBLISHED_SNAPSHOT_REVALIDATE_SECONDS } from './cache.constants';

/**
 * Owner of `next/cache`.
 *
 * Public portfolio reads are tag-cached so an anonymous request costs a cache
 * hit rather than a database round trip. Publishing, unpublishing and slug
 * changes invalidate the tag explicitly — a stale published page is a
 * correctness bug, not a performance detail, because after a slug change the
 * old address must stop serving immediately.
 */

export function cacheBySlug<TArgs extends readonly unknown[], TResult>(
  loader: (...args: TArgs) => Promise<TResult>,
  keyParts: readonly string[],
  tag: string,
): (...args: TArgs) => Promise<TResult> {
  return unstable_cache(loader, [...keyParts], {
    tags: [tag],
    revalidate: PUBLISHED_SNAPSHOT_REVALIDATE_SECONDS,
  });
}

/**
 * Invalidate from a Server Action. `updateTag` gives read-your-own-writes
 * semantics, which is what makes "publish, then land on the public URL" show
 * the new version rather than the previous snapshot.
 */
export function invalidateTagImmediately(tag: string): void {
  updateTag(tag);
}

/** Invalidate from a route handler or background path. */
export function invalidateTag(tag: string): void {
  revalidateTag(tag, 'max');
}

export function invalidatePath(path: string): void {
  revalidatePath(path);
}

export { PUBLISHED_SNAPSHOT_REVALIDATE_SECONDS } from './cache.constants';
