import type { PortfolioDocument } from '@/modules/portfolio-document';

/**
 * Public bytes are reachable only when the immutable published snapshot names
 * them. Ownership alone is insufficient: an owner's draft and deleted uploads
 * must not become public merely because another portfolio is published.
 */
export function isPublishedAssetReferenced(document: PortfolioDocument, assetId: string): boolean {
  if (document.identity.portraitAssetId === assetId) {
    return true;
  }

  if (document.projects.some((project) => project.coverAssetId === assetId)) {
    return true;
  }

  if (document.gallery.some((item) => item.assetId === assetId)) {
    return true;
  }

  return document.attachments.some(
    (attachment) => attachment.assetId === assetId && attachment.visible,
  );
}
