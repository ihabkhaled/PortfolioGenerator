/**
 * The narrow storage contract the product depends on.
 *
 * Four operations, no listing, no public URLs, no signed links. Every one of
 * those would be a way for a private CV to become reachable without passing
 * through an authorization check, and none of them is needed: the only reader
 * is a server action that has already resolved the owner.
 */
export interface ObjectStorage {
  /** Store bytes under a server-generated key. */
  putPrivate: (key: string, body: Uint8Array, contentType: string) => Promise<void>;
  /** Read bytes back. Callers must have authorized the owner first. */
  getPrivate: (key: string) => Promise<Uint8Array | null>;
  /** Idempotent: deleting an absent object is a success. */
  delete: (key: string) => Promise<void>;
  exists: (key: string) => Promise<boolean>;
}

export type StorageDriver = 'local' | 's3';
