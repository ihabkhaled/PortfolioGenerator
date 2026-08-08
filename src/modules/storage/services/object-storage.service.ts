import 'server-only';

import { randomBytes } from 'node:crypto';

import { getServerEnv } from '@/packages/env/server';

import { OBJECT_STORAGE_REGISTRY } from '../constants/storage-registry.constants';
import { STORAGE_KEY_RANDOM_BYTES } from '../constants/storage.constants';
import { buildStorageKey } from '../policies/storage-key.policy';
import { createLocalObjectStorage } from '../providers/local-object-storage.provider';
import { createS3ObjectStorage } from '../providers/s3-object-storage.provider';
import type { ObjectStorage } from '../types/object-storage.types';

/**
 * Selects the storage adapter from configuration and hands out object keys.
 *
 * The rest of the application never learns which driver is active — that is the
 * point of the adapter. A deployment can move from a local disk to R2 without
 * a single line of ingestion code changing.
 */

export function getObjectStorage(): ObjectStorage {
  if (OBJECT_STORAGE_REGISTRY.value) {
    return OBJECT_STORAGE_REGISTRY.value;
  }

  const env = getServerEnv();
  const storage =
    env.STORAGE_DRIVER === 's3'
      ? createS3ObjectStorage({
          endpoint: env.S3_ENDPOINT ?? '',
          bucket: env.S3_BUCKET ?? '',
          region: env.S3_REGION,
          accessKeyId: env.S3_ACCESS_KEY_ID ?? '',
          secretAccessKey: env.S3_SECRET_ACCESS_KEY ?? '',
        })
      : createLocalObjectStorage(env.STORAGE_LOCAL_ROOT);

  OBJECT_STORAGE_REGISTRY.value = storage;

  return storage;
}

/**
 * A fresh, unguessable key. Randomness comes from `crypto`, never a timestamp
 * or a counter: a predictable key is one authorization bug away from letting
 * someone enumerate other people's CVs.
 */
export function generateStorageKey(ownerId: string, prefix: string): string {
  return buildStorageKey(ownerId, prefix, randomBytes(STORAGE_KEY_RANDOM_BYTES).toString('hex'));
}

/** Test hook: replace or clear the configured adapter. */
export function setObjectStorage(storage: ObjectStorage | null): void {
  OBJECT_STORAGE_REGISTRY.value = storage;
}
