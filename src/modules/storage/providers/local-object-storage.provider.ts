import 'server-only';

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { isValidStorageKey } from '../policies/storage-key.policy';
import type { ObjectStorage } from '../types/object-storage.types';

/**
 * Filesystem storage for development and tests.
 *
 * Private by construction: the root is outside `public/`, so nothing here is
 * served by the web server even by accident. Every key is validated before it
 * is joined to the root, and the resolved path is checked to still be inside
 * it — belt and braces, because a path-traversal bug in the CV store is the
 * worst bug this product could have.
 */
export function createLocalObjectStorage(root: string): ObjectStorage {
  const absoluteRoot = path.resolve(root);

  function resolveKeyPath(key: string): string {
    if (!isValidStorageKey(key)) {
      throw new Error('Invalid storage key');
    }

    const resolved = path.resolve(absoluteRoot, key);

    if (resolved !== absoluteRoot && !resolved.startsWith(`${absoluteRoot}${path.sep}`)) {
      throw new Error('Storage key escaped the storage root');
    }

    return resolved;
  }

  return {
    async putPrivate(key, body) {
      const target = resolveKeyPath(key);

      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, body);
    },

    async getPrivate(key) {
      try {
        const buffer = await readFile(resolveKeyPath(key));

        return new Uint8Array(buffer);
      } catch {
        return null;
      }
    },

    async delete(key) {
      await rm(resolveKeyPath(key), { force: true });
    },

    async exists(key) {
      try {
        await readFile(resolveKeyPath(key));

        return true;
      } catch {
        return false;
      }
    },
  };
}
