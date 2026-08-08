import 'server-only';

import { createSignedFetch } from '@/packages/object-store';
import { trimCharacter } from '@/shared/utils/text.util';

import { isValidStorageKey } from '../policies/storage-key.policy';
import type { ObjectStorage } from '../types/object-storage.types';
import type { S3StorageConfig } from '../types/storage-config.types';

/**
 * S3-compatible storage for production — AWS S3, Cloudflare R2, MinIO.
 *
 * Objects are written with no public ACL and read only through signed server
 * requests. The product never hands a browser a storage URL: a CV reaches its
 * owner through an authorized route that streams it, so there is no link to
 * leak, expire, or forward.
 */
export function createS3ObjectStorage(config: S3StorageConfig): ObjectStorage {
  const signedFetch = createSignedFetch({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: config.region,
    service: 's3',
  });

  function objectUrl(key: string): string {
    if (!isValidStorageKey(key)) {
      throw new Error('Invalid storage key');
    }

    return `${trimCharacter(config.endpoint, '/')}/${config.bucket}/${key}`;
  }

  return {
    async putPrivate(key, body, contentType) {
      const response = await signedFetch(objectUrl(key), {
        method: 'PUT',
        // `Uint8Array` is a valid request body at runtime; the DOM lib types
        // model `BodyInit` without it because it predates resizable buffers.
        body: body as unknown as BodyInit,
        headers: { 'content-type': contentType },
      });

      if (!response.ok) {
        throw new Error(`Object storage rejected the upload (${response.status})`);
      }
    },

    async getPrivate(key) {
      const response = await signedFetch(objectUrl(key), { method: 'GET' });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Object storage read failed (${response.status})`);
      }

      return new Uint8Array(await response.arrayBuffer());
    },

    async delete(key) {
      const response = await signedFetch(objectUrl(key), { method: 'DELETE' });

      // 404 counts as success: deletion is idempotent, and a retry after a
      // partial failure must not leave the caller unable to finish.
      if (!response.ok && response.status !== 404) {
        throw new Error(`Object storage delete failed (${response.status})`);
      }
    },

    async exists(key) {
      const response = await signedFetch(objectUrl(key), { method: 'HEAD' });

      return response.ok;
    },
  };
}
