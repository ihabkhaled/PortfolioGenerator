import type { AssetUploadAction } from '@/modules/assets';

export interface PortraitUploadProps {
  readonly portfolioId: string;
  readonly hasPortrait: boolean;
  readonly uploadAction: AssetUploadAction;
  readonly onUploaded: (assetId: string) => void;
  readonly onRemove: () => void;
}
