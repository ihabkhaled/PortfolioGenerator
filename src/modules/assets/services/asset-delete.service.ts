import 'server-only';

import { getObjectStorage } from '@/modules/storage/server';
import { logger } from '@/packages/logger';

import { nextAssetDeletionRetryAt } from '../policies/asset-deletion-retry.policy';
import {
  listDueAssetDeletionTombstones,
  markAssetObjectDeleted,
  scheduleAssetDeletionRetry,
  softDeleteOwnedAsset,
} from '../repositories/asset.repository';

export async function deleteOwnedAsset(ownerId: string, assetId: string): Promise<boolean> {
  const asset = await softDeleteOwnedAsset(ownerId, assetId, new Date());

  if (asset === null) {
    return false;
  }

  await attemptObjectDeletion(asset, new Date());

  return true;
}

export async function retryDueAssetDeletions(now: Date, limit = 50): Promise<number> {
  const tombstones = await listDueAssetDeletionTombstones(now, limit);
  await Promise.all(tombstones.map((asset) => attemptObjectDeletion(asset, now)));
  return tombstones.length;
}

async function attemptObjectDeletion(
  asset: Awaited<ReturnType<typeof listDueAssetDeletionTombstones>>[number],
  now: Date,
): Promise<void> {
  try {
    await getObjectStorage().delete(asset.storageKey);
    await markAssetObjectDeleted(asset.id, now);
  } catch (error) {
    const attempts = asset.deletionAttempts + 1;
    await scheduleAssetDeletionRetry(asset.id, attempts, nextAssetDeletionRetryAt(now, attempts));
    logger.error('asset.object_deletion_failed', {
      assetId: asset.id,
      attempts,
      reason: String(error),
    });
  }
}
