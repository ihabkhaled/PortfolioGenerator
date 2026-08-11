import { findVisiblePage, type PortfolioDocument } from '@/modules/portfolio-document';

/**
 * Public bytes are reachable only when the immutable published snapshot names
 * them. Ownership alone is insufficient: an owner's draft and deleted uploads
 * must not become public merely because another portfolio is published.
 */
export function isPublishedAssetReferenced(document: PortfolioDocument, assetId: string): boolean {
  const visibleSections = document.pages
    .filter((page) => page.visible && page.visibility === 'public')
    .flatMap((page) => page.sections.filter((section) => section.visible));

  if (
    document.identity.portraitAssetId === assetId &&
    visibleSections.some((section) => section.type === 'hero' && section.config.showPortrait)
  ) {
    return true;
  }

  if (
    document.projects.some((project) => project.coverAssetId === assetId) &&
    visibleSections.some((section) => section.type === 'projects')
  ) {
    return true;
  }

  const rendersGallery = visibleSections.some(
    (section) => section.type === 'about' || section.type === 'gallery',
  );

  if (rendersGallery && document.gallery.some((item) => item.assetId === assetId)) {
    return true;
  }

  const rendersAttachments = visibleSections.some(
    (section) => section.type === 'about' || section.type === 'attachments',
  );

  return (
    rendersAttachments &&
    document.attachments.some((attachment) => attachment.assetId === assetId && attachment.visible)
  );
}

export function isAssetReferencedOnPage(
  document: PortfolioDocument,
  pageSlug: string,
  assetId: string,
): boolean {
  const resolved = findVisiblePage(document, pageSlug);
  if (resolved?.page.visibility !== 'private') return false;
  const visibleSections = resolved.sections.filter((section) => section.visible);

  if (
    document.identity.portraitAssetId === assetId &&
    visibleSections.some((section) => section.type === 'hero' && section.config.showPortrait)
  )
    return true;
  if (
    document.projects.some((project) => project.coverAssetId === assetId) &&
    visibleSections.some((section) => section.type === 'projects')
  )
    return true;
  if (
    visibleSections.some((section) => section.type === 'about' || section.type === 'gallery') &&
    document.gallery.some((item) => item.assetId === assetId)
  )
    return true;
  return (
    visibleSections.some((section) => section.type === 'about' || section.type === 'attachments') &&
    document.attachments.some((attachment) => attachment.assetId === assetId && attachment.visible)
  );
}
