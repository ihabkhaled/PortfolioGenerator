import 'server-only';

/** Server-only surface: the configured adapter and key generation. */

export { createLocalObjectStorage } from './providers/local-object-storage.provider';
export { createS3ObjectStorage } from './providers/s3-object-storage.provider';
export {
  generateStorageKey,
  getObjectStorage,
  setObjectStorage,
} from './services/object-storage.service';
