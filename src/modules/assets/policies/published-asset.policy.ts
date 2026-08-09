import type { PortfolioDocument } from '@/modules/portfolio-document';

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

  const hasVisibleAboutSection = visibleSections.some((section) => section.type === 'about');

  if (hasVisibleAboutSection && document.gallery.some((item) => item.assetId === assetId)) {
    return true;
  }

  return (
    hasVisibleAboutSection &&
    document.attachments.some((attachment) => attachment.assetId === assetId && attachment.visible)
  );
}
