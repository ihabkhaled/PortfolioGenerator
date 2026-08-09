import type { AssetRecord, AssetUploadAction } from '@/modules/assets';
import type { PortfolioDocument } from '@/modules/portfolio-document';

export interface AssetCollectionsUploadProps {
  readonly portfolioId: string;
  readonly gallery: PortfolioDocument['gallery'];
  readonly attachments: PortfolioDocument['attachments'];
  readonly uploadAction: AssetUploadAction;
  readonly onGalleryUploaded: (asset: AssetRecord, alt: string, caption: string) => void;
  readonly onAttachmentUploaded: (
    asset: AssetRecord,
    kind: PortfolioDocument['attachments'][number]['kind'],
    label: string,
  ) => void;
  readonly onGalleryRemove: (index: number) => void;
  readonly onAttachmentRemove: (index: number) => void;
  readonly onAttachmentVisibilityChange?: (index: number, visible: boolean) => void;
}
