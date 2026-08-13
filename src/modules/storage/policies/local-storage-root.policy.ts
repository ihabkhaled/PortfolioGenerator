import { tmpdir } from 'node:os';
import path from 'node:path';

import { VERCEL_LOCAL_STORAGE_DIRECTORY } from '../constants/storage.constants';

export function getVercelLocalStorageRoot(): string {
  return path.join(tmpdir(), VERCEL_LOCAL_STORAGE_DIRECTORY);
}
