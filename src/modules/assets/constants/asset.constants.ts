import type { UploadPurpose } from '@/modules/file-security';

import type { AssetUploadFormState } from '../types/asset-form.types';
import type { AssetVisibility } from '../types/asset.types';

export const ASSET_UPLOAD_INITIAL_STATE: AssetUploadFormState = { status: 'idle' };

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
} as const;
