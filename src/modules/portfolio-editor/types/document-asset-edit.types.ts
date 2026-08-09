import type { PortfolioDocument } from '@/modules/portfolio-document';

export interface GalleryAssetEditInput {
  readonly assetId: string;
  readonly alt: string;
  readonly caption: string;
}

export interface AttachmentAssetEditInput {
  readonly assetId: string;
  readonly kind: PortfolioDocument['attachments'][number]['kind'];
  readonly label: string;
  readonly fileName: string;
  readonly contentType: string;
  readonly sizeBytes: number;
}
