/** Public surface of the storage module (types and pure policy only). */

export {
  ASSET_KEY_PREFIX,
  EXTRACTED_TEXT_KEY_PREFIX,
  PDF_CONTENT_TYPE,
  RESUME_KEY_PREFIX,
  STORAGE_KEY_PATTERN,
  TEXT_CONTENT_TYPE,
} from './constants/storage.constants';
export {
  buildStorageKey,
  isValidStorageKey,
  randomTokenLength,
  sanitizeSegment,
} from './policies/storage-key.policy';
export type { ObjectStorage, StorageDriver } from './types/object-storage.types';
export type { S3StorageConfig } from './types/storage-config.types';
