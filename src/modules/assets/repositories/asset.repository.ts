import 'server-only';

import { DbNull, getDatabase } from '@/packages/database';

import {
  ASSET_PURPOSE_TO_DATABASE,
  ASSET_SELECT,
  ASSET_VISIBILITY_TO_DATABASE,
} from '../constants/asset.constants';
import { toAssetRecord } from '../mappers/asset.mapper';
import type { AssetRecord, CreateAssetInput, PublishedAssetRecord } from '../types/asset.types';

export async function createOwnedAsset(input: CreateAssetInput): Promise<AssetRecord> {
  const row = await getDatabase().asset.create({
    data: {
      ownerId: input.ownerId,
      portfolioId: input.portfolioId,
      purpose: ASSET_PURPOSE_TO_DATABASE[input.purpose],
      visibility: ASSET_VISIBILITY_TO_DATABASE[input.visibility],
      scanStatus: 'CLEAN',
      storageKey: input.storageKey,
      originalFilename: input.fileName,
      contentType: input.inspection.contentType,
      extension: input.inspection.extension,
      sizeBytes: input.bytes.length,
      sha256: input.sha256,
      width: input.inspection.dimensions?.width ?? null,
      height: input.inspection.dimensions?.height ?? null,
    },
    select: ASSET_SELECT,
  });

  return toAssetRecord(row);
}

export async function getOwnedAsset(ownerId: string, assetId: string): Promise<AssetRecord | null> {
  const row = await getDatabase().asset.findFirst({
    where: { id: assetId, ownerId, deletedAt: null },
    select: ASSET_SELECT,
  });

  return row === null ? null : toAssetRecord(row);
}

export async function listOwnedAssetKeys(ownerId: string): Promise<readonly string[]> {
  const rows = await getDatabase().asset.findMany({
    // Include soft-deleted rows: a previous object deletion may have failed,
    // and account deletion is the final opportunity to sweep that key.
    where: { ownerId },
    select: { storageKey: true },
  });
  return rows.map((row) => row.storageKey);
}

export async function listOwnedAssetKeysForPortfolio(
  ownerId: string,
  portfolioId: string,
): Promise<readonly string[]> {
  const rows = await getDatabase().asset.findMany({
    // A deleted row whose object survived a transient storage failure is
    // exactly what the portfolio sweep must find.
    where: { ownerId, portfolioId },
    select: { storageKey: true },
  });
  return rows.map((row) => row.storageKey);
}

export async function softDeleteOwnedAssetsForPortfolio(
  ownerId: string,
  portfolioId: string,
  deletedAt: Date,
): Promise<number> {
  const result = await getDatabase().asset.updateMany({
    where: { ownerId, portfolioId, deletedAt: null },
    data: { deletedAt },
  });
  return result.count;
}

export async function softDeleteOwnedAsset(
  ownerId: string,
  assetId: string,
  deletedAt: Date,
): Promise<AssetRecord | null> {
  const updated = await getDatabase().asset.updateMany({
    where: { id: assetId, ownerId, deletedAt: null },
    data: { deletedAt },
  });

  return updated.count === 0 ? null : getOwnedAssetIncludingDeleted(ownerId, assetId);
}

async function getOwnedAssetIncludingDeleted(
  ownerId: string,
  assetId: string,
): Promise<AssetRecord | null> {
  const row = await getDatabase().asset.findFirst({
    where: { id: assetId, ownerId },
    select: ASSET_SELECT,
  });

  return row === null ? null : toAssetRecord(row);
}

export async function findPublishedAssetUnscoped(
  assetId: string,
): Promise<PublishedAssetRecord | null> {
  const row = await getDatabase().asset.findFirst({
    where: {
      id: assetId,
      visibility: 'PUBLIC',
      scanStatus: 'CLEAN',
      deletedAt: null,
      portfolio: { status: 'PUBLISHED', deletedAt: null, publishedDocument: { not: DbNull } },
    },
    select: { ...ASSET_SELECT, portfolio: { select: { publishedDocument: true } } },
  });

  return row === null
    ? null
    : { asset: toAssetRecord(row), publishedDocument: row.portfolio.publishedDocument };
}
