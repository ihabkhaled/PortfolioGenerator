import {
  ASSET_DELETION_MAX_RETRY_DELAY_MS,
  ASSET_DELETION_MIN_RETRY_DELAY_MS,
} from '../constants/asset.constants';

export function nextAssetDeletionRetryAt(now: Date, attempts: number): Date {
  const exponent = Math.max(0, attempts - 1);
  const delay = Math.min(
    ASSET_DELETION_MIN_RETRY_DELAY_MS * 2 ** exponent,
    ASSET_DELETION_MAX_RETRY_DELAY_MS,
  );
  return new Date(now.getTime() + delay);
}
