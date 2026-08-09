import 'server-only';

import { createHash } from 'node:crypto';

import { ASSET_KEY_PREFIX } from '@/modules/storage';
import { generateStorageKey, getObjectStorage } from '@/modules/storage/server';

import { createOwnedAsset } from '../repositories/asset.repository';
import type { AssetRecord, StoreScannedResumeAssetInput } from '../types/asset.types';

/** Copies already-scanned import bytes into the owner-controlled asset lifecycle. */
export async function storeScannedResumeAsset(
  input: StoreScannedResumeAssetInput,
): Promise<AssetRecord> {
  const storage = getObjectStorage();
  const storageKey = generateStorageKey(input.ownerId, ASSET_KEY_PREFIX);
  const sha256 = createHash('sha256').update(input.bytes).digest('hex');

  await storage.putPrivate(storageKey, input.bytes, input.inspection.contentType);

  try {
    return await createOwnedAsset({
      ownerId: input.ownerId,
      portfolioId: input.portfolioId,
      purpose: 'resume',
      visibility: 'public',
      fileName: input.fileName,
      declaredContentType: input.inspection.contentType,
      bytes: input.bytes,
      inspection: input.inspection,
      storageKey,
      sha256,
    });
  } catch (error) {
    await storage.delete(storageKey);
    throw error;
  }
}
