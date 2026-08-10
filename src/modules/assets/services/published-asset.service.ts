import 'server-only';

import { tryMigratePortfolioDocument } from '@/modules/portfolio-document';
import { getObjectStorage } from '@/modules/storage/server';

import {
  isAssetReferencedOnPage,
  isPublishedAssetReferenced,
} from '../policies/published-asset.policy';
import { findPublishedAssetUnscoped, getOwnedAsset } from '../repositories/asset.repository';
import type { PublishedAssetBytes } from '../types/asset.types';

/**
 * The editor's own live preview, scoped by session ownership rather than
 * publish state — see `buildDashboardAssetPath` for why this exists
 * alongside `getPublishedAssetBytesUnscoped`. Also cross-checks the
 * portfolio id in the URL, so a link copied from one draft cannot be reused
 * to read an asset that belongs to a different one of the same owner's
 * portfolios.
 */
export async function getOwnedAssetBytes(
  ownerId: string,
  portfolioId: string,
  assetId: string,
): Promise<PublishedAssetBytes | null> {
  const asset = await getOwnedAsset(ownerId, assetId);

  if (asset === null || asset.portfolioId !== portfolioId) {
    return null;
  }

  const bytes = await getObjectStorage().getPrivate(asset.storageKey);

  return bytes === null ? null : { asset, bytes };
}

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

export async function getPrivatePageAssetBytesUnscoped(
  assetId: string,
  portfolioSlug: string,
  pageSlug: string,
): Promise<PublishedAssetBytes | null> {
  const found = await findPublishedAssetUnscoped(assetId);
  if (found?.portfolioSlug !== portfolioSlug) return null;
  const document = tryMigratePortfolioDocument(found.publishedDocument);
  if (document === null || !isAssetReferencedOnPage(document, pageSlug, assetId)) return null;
  const bytes = await getObjectStorage().getPrivate(found.asset.storageKey);
  return bytes === null ? null : { asset: found.asset, bytes };
}
