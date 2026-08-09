import 'server-only';

import { createHash } from 'node:crypto';

import { inspectAndScanForPurpose } from '@/modules/file-security/server';
import { getOwnedPortfolio } from '@/modules/portfolios/server';
import { ASSET_KEY_PREFIX } from '@/modules/storage';
import { generateStorageKey, getObjectStorage } from '@/modules/storage/server';

import { createOwnedAsset } from '../repositories/asset.repository';
import type { UploadAssetInput, UploadAssetResult } from '../types/asset.types';

export async function uploadOwnedAsset(input: UploadAssetInput): Promise<UploadAssetResult> {
  const portfolio = await getOwnedPortfolio(input.ownerId, input.portfolioId);

  if (portfolio === null) {
    return { ok: false, reason: 'not-found' };
  }

  const inspection = await inspectAndScanForPurpose({
    purpose: input.purpose,
    fileName: input.fileName,
    declaredContentType: input.declaredContentType,
    bytes: input.bytes,
  });

  if (!inspection.ok) {
    return { ok: false, reason: 'rejected', rejection: inspection.rejection };
  }

  // Scanning can outlive a concurrent portfolio deletion. Re-resolve ownership
  // immediately before storage so that race cannot create an asset attached to
  // a soft-deleted portfolio after its object sweep has already finished.
  if ((await getOwnedPortfolio(input.ownerId, input.portfolioId)) === null) {
    return { ok: false, reason: 'not-found' };
  }

  const storage = getObjectStorage();
  const storageKey = generateStorageKey(input.ownerId, ASSET_KEY_PREFIX);
  const sha256 = createHash('sha256').update(input.bytes).digest('hex');

  await storage.putPrivate(storageKey, input.bytes, inspection.contentType);

  try {
    const asset = await createOwnedAsset({ ...input, inspection, storageKey, sha256 });

    return { ok: true, asset };
  } catch (error) {
    await storage.delete(storageKey);
    throw error;
  }
}
