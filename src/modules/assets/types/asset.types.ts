import type { FileInspection, FileRejection, UploadPurpose } from '@/modules/file-security';

export type AssetVisibility = 'private' | 'public';

export interface AssetRecord {
  readonly id: string;
  readonly ownerId: string;
  readonly portfolioId: string;
  readonly purpose: UploadPurpose;
  readonly visibility: AssetVisibility;
  readonly storageKey: string;
  readonly originalFilename: string;
  readonly contentType: string;
  readonly extension: string;
  readonly sizeBytes: number;
  readonly sha256: string;
  readonly width: number | null;
  readonly height: number | null;
  readonly createdAt: Date;
  readonly deletedAt: Date | null;
}

export interface UploadAssetInput {
  readonly ownerId: string;
  readonly portfolioId: string;
  readonly purpose: UploadPurpose;
  readonly visibility: AssetVisibility;
  readonly fileName: string;
  readonly declaredContentType: string;
  readonly bytes: Uint8Array;
}

export type UploadAssetResult =
  | { readonly ok: true; readonly asset: AssetRecord }
  | { readonly ok: false; readonly reason: 'not-found' }
  | { readonly ok: false; readonly reason: 'rejected'; readonly rejection: FileRejection };

export interface CreateAssetInput extends UploadAssetInput {
  readonly storageKey: string;
  readonly sha256: string;
  readonly inspection: Extract<FileInspection, { readonly ok: true }>;
}

export interface PublishedAssetRecord {
  readonly asset: AssetRecord;
  readonly publishedDocument: unknown;
}

export interface AssetRow extends Omit<AssetRecord, 'purpose' | 'visibility'> {
  readonly purpose: 'RESUME' | 'PORTRAIT' | 'GALLERY' | 'CERTIFICATE' | 'ATTACHMENT';
  readonly visibility: 'PRIVATE' | 'PUBLIC';
}

export interface PublishedAssetBytes {
  readonly asset: AssetRecord;
  readonly bytes: Uint8Array;
}
