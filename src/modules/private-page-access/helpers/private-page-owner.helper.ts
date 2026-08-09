import { HOME_PAGE_SLUG, type PortfolioDocument } from '@/modules/portfolio-document';

export function setDocumentPageAccess(
  document: PortfolioDocument,
  pageId: string,
  visibility: 'public' | 'private',
  passwordHash: string | null,
): PortfolioDocument | null {
  if (!canSetDocumentPageAccess(document, pageId, visibility)) {
    return null;
  }

  return {
    ...document,
    pages: document.pages.map((page) =>
      page.id === pageId
        ? {
            ...page,
            visibility,
            passwordHash: visibility === 'private' ? passwordHash : null,
          }
        : page,
    ),
  };
}

export function canSetDocumentPageAccess(
  document: PortfolioDocument,
  pageId: string,
  visibility: 'public' | 'private',
): boolean {
  const target = document.pages.find((page) => page.id === pageId);

  if (target === undefined) return false;
  return visibility !== 'private' || target.slug !== HOME_PAGE_SLUG;
}
