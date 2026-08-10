import type { UploadPurpose } from '@/modules/file-security';

import type { AssetUploadFormState } from '../types/asset-form.types';
import type { AssetVisibility } from '../types/asset.types';

export const ASSET_UPLOAD_INITIAL_STATE: AssetUploadFormState = { status: 'idle' };

export const ASSET_DELETION_MIN_RETRY_DELAY_MS = 60_000;
export const ASSET_DELETION_MAX_RETRY_DELAY_MS = 86_400_000;
export const ASSET_DELETION_BATCH_SIZE = 50;
export const ASSET_DELETION_NO_STORE_HEADERS = { 'Cache-Control': 'no-store' } as const;

/** Session-scoped draft bytes: never cached, never indexed. */
export const OWNED_ASSET_RESPONSE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
} as const;

export const UPLOAD_PURPOSE_SET: ReadonlySet<UploadPurpose> = new Set([
  'resume',
  'portrait',
  'gallery',
  'certificate',
  'attachment',
]);

export const ASSET_PURPOSE_TO_DATABASE = {
  resume: 'RESUME',
  portrait: 'PORTRAIT',
  gallery: 'GALLERY',
  certificate: 'CERTIFICATE',
  attachment: 'ATTACHMENT',
} as const;

export const ASSET_PURPOSE_FROM_DATABASE = {
  RESUME: 'resume',
  PORTRAIT: 'portrait',
  GALLERY: 'gallery',
  CERTIFICATE: 'certificate',
  ATTACHMENT: 'attachment',
} as const;

export const ASSET_VISIBILITY_TO_DATABASE: Readonly<Record<AssetVisibility, 'PRIVATE' | 'PUBLIC'>> =
  {
    private: 'PRIVATE',
    public: 'PUBLIC',
  };

export const ASSET_VISIBILITY_FROM_DATABASE = {
  PRIVATE: 'private',
  PUBLIC: 'public',
} as const;

export const ASSET_SELECT = {
  id: true,
  ownerId: true,
  portfolioId: true,
  purpose: true,
  visibility: true,
  storageKey: true,
  originalFilename: true,
  contentType: true,
  extension: true,
  sizeBytes: true,
  sha256: true,
  width: true,
  height: true,
  createdAt: true,
  deletedAt: true,
  objectDeletedAt: true,
  deletionAttempts: true,
  deletionRetryAt: true,
} as const;
