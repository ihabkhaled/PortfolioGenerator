import 'server-only';

import { getObjectStorage } from '@/modules/storage/server';

import { softDeleteOwnedAsset } from '../repositories/asset.repository';

export async function deleteOwnedAsset(ownerId: string, assetId: string): Promise<boolean> {
  const asset = await softDeleteOwnedAsset(ownerId, assetId, new Date());

  if (asset === null) {
    return false;
  }

  await getObjectStorage().delete(asset.storageKey);

  return true;
}
