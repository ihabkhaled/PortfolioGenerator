import type { ObjectStorage } from '../types/object-storage.types';

/**
 * The process-wide slot holding the configured storage adapter.
 *
 * A mutable holder rather than a `let` inside the service, because the
 * architecture keeps module-level declarations in `constants/` where they are
 * greppable. That constraint pays off here: there is exactly one place to look
 * to answer "is anything caching a storage client, and can a test replace it".
 */
export const OBJECT_STORAGE_REGISTRY: { value: ObjectStorage | null } = { value: null };
