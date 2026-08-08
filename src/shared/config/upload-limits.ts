import 'server-only';

import { getServerEnv } from '@/packages/env/server';
import { BYTES_PER_MEGABYTE } from '@/shared/constants/units.constants';

export interface UploadLimits {
  readonly maxMegabytes: number;
  readonly maxPages: number;
}

/**
 * The upload limits, in the units a person reads.
 *
 * Shown in the UI *before* an upload rather than only in the rejection message:
 * a limit a user discovers by hitting it is a limit that wasted their time.
 */
export function getUploadLimits(): UploadLimits {
  const env = getServerEnv();

  return {
    maxMegabytes: Math.floor(env.UPLOAD_MAX_BYTES / BYTES_PER_MEGABYTE),
    maxPages: env.UPLOAD_MAX_PAGES,
  };
}
