import 'server-only';

import { tryMigratePortfolioDocument } from '@/modules/portfolio-document';
import { getObjectStorage } from '@/modules/storage/server';

import { isPublishedAssetReferenced } from '../policies/published-asset.policy';
import { findPublishedAssetUnscoped } from '../repositories/asset.repository';
import type { PublishedAssetBytes } from '../types/asset.types';

export async function getPublishedAssetBytesUnscoped(
  assetId: string,
): Promise<PublishedAssetBytes | null> {
  const found = await findPublishedAssetUnscoped(assetId);

  if (found === null) {
    return null;
  }

  const document = tryMigratePortfolioDocument(found.publishedDocument);

  if (document === null || !isPublishedAssetReferenced(document, assetId)) {
    return null;
  }

  const bytes = await getObjectStorage().getPrivate(found.asset.storageKey);

  return bytes === null ? null : { asset: found.asset, bytes };
}
