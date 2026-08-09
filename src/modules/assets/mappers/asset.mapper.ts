import {
  ASSET_PURPOSE_FROM_DATABASE,
  ASSET_VISIBILITY_FROM_DATABASE,
} from '../constants/asset.constants';
import type { AssetRecord, AssetRow } from '../types/asset.types';

export function toAssetRecord(row: AssetRow): AssetRecord {
  return {
    ...row,
    purpose: ASSET_PURPOSE_FROM_DATABASE[row.purpose],
    visibility: ASSET_VISIBILITY_FROM_DATABASE[row.visibility],
  };
}
