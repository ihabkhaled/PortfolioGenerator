import 'server-only';

import { getDatabase } from '@/packages/database';

import { RESUME_UPLOAD_SELECT } from '../constants/resume-upload-query.constants';
import type {
  CreateResumeUploadInput,
  ResumeUploadRecord,
  StorageKeyRow,
  UpdateResumeUploadInput,
} from '../types/resume-upload.types';

/**
 * Owner-scoped access to resume uploads.
 *
 * Same rule as the portfolio repository, and it matters more here: these rows
 * point at the private CV files. Every read takes an owner id, and there is no
 * finder that does not.
 */

export async function createResumeUpload(
  input: CreateResumeUploadInput,
): Promise<ResumeUploadRecord> {
  return getDatabase().resumeUpload.create({
    data: {
      ownerId: input.ownerId,
      portfolioId: input.portfolioId,
      storageKey: input.storageKey,
      originalFilename: input.originalFilename,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      sha256: input.sha256,
      status: input.status,
    },
    select: RESUME_UPLOAD_SELECT,
  });
}

export async function getOwnedResumeUpload(
  ownerId: string,
  uploadId: string,
): Promise<ResumeUploadRecord | null> {
  return getDatabase().resumeUpload.findFirst({
    where: { id: uploadId, ownerId, deletedAt: null },
    select: RESUME_UPLOAD_SELECT,
  });
}

export async function getLatestOwnedUpload(
  ownerId: string,
  portfolioId: string,
): Promise<ResumeUploadRecord | null> {
  return getDatabase().resumeUpload.findFirst({
    where: { ownerId, portfolioId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    select: RESUME_UPLOAD_SELECT,
  });
}

/**
 * Find a previous successful import of the exact same bytes, by the same owner.
 *
 * Scoped to the owner deliberately. Two people can upload byte-identical CVs —
 * from a shared template, or because one is the other's — and reusing an
 * extraction across owners would be a cross-tenant read of private data
 * disguised as a cache hit.
 */
export async function findOwnedUploadByHash(
  ownerId: string,
  sha256: string,
): Promise<ResumeUploadRecord | null> {
  return getDatabase().resumeUpload.findFirst({
    where: { ownerId, sha256, status: { in: ['NEEDS_REVIEW', 'READY'] }, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    select: RESUME_UPLOAD_SELECT,
  });
}

export async function updateOwnedResumeUpload(
  ownerId: string,
  uploadId: string,
  update: UpdateResumeUploadInput,
): Promise<ResumeUploadRecord | null> {
  const updated = await getDatabase().resumeUpload.updateMany({
    where: { id: uploadId, ownerId, deletedAt: null },
    // Spread only the keys the caller set. Under `exactOptionalPropertyTypes`
    // an explicit `undefined` is a value, and Prisma reads it as 'set to
    // undefined' rather than 'leave alone'.
    data: Object.fromEntries(Object.entries(update).filter(([, value]) => value !== undefined)),
  });

  return updated.count === 0 ? null : getOwnedResumeUpload(ownerId, uploadId);
}

export async function countImportsToday(ownerId: string, since: Date): Promise<number> {
  return getDatabase().resumeUpload.count({
    where: { ownerId, createdAt: { gte: since } },
  });
}

export async function softDeleteOwnedUpload(
  ownerId: string,
  uploadId: string,
  deletedAt: Date,
): Promise<ResumeUploadRecord | null> {
  const updated = await getDatabase().resumeUpload.updateMany({
    where: { id: uploadId, ownerId, deletedAt: null },
    data: { deletedAt },
  });

  return updated.count === 0 ? null : getOwnedResumeUpload(ownerId, uploadId);
}

/** Every upload an owner has, for the account-deletion sweep. */
export async function listOwnedUploadKeys(ownerId: string): Promise<readonly string[]> {
  const rows = await getDatabase().resumeUpload.findMany({
    where: { ownerId },
    select: { storageKey: true, extractedTextStorageKey: true },
  });

  return toStorageKeys(rows);
}

/**
 * Every upload belonging to one portfolio, for the per-portfolio sweep.
 *
 * Soft-deleted rows are included on purpose. A row marked deleted whose object
 * is still in the bucket is precisely what this list exists to clean up; a
 * filter here would leave those files behind forever.
 */
export async function listOwnedUploadKeysForPortfolio(
  ownerId: string,
  portfolioId: string,
): Promise<readonly string[]> {
  const rows = await getDatabase().resumeUpload.findMany({
    where: { ownerId, portfolioId },
    select: { storageKey: true, extractedTextStorageKey: true },
  });

  return toStorageKeys(rows);
}

export function toStorageKeys(rows: readonly StorageKeyRow[]): readonly string[] {
  return rows.flatMap((row) =>
    [row.storageKey, row.extractedTextStorageKey].filter((key): key is string => key !== null),
  );
}

/** Mark every upload of one portfolio deleted, in one statement. */
export async function softDeleteUploadsForPortfolio(
  ownerId: string,
  portfolioId: string,
  deletedAt: Date,
): Promise<number> {
  const updated = await getDatabase().resumeUpload.updateMany({
    where: { ownerId, portfolioId, deletedAt: null },
    data: { deletedAt },
  });

  return updated.count;
}
