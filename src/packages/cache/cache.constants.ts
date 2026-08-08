/**
 * Ceiling on how long a published snapshot may be served from cache.
 *
 * Publishing invalidates the tag immediately, so this only matters if an
 * invalidation is ever lost — it is the blast radius of that bug, not the
 * normal refresh interval.
 */
export const PUBLISHED_SNAPSHOT_REVALIDATE_SECONDS = 3600;
