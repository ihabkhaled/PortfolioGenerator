import type { PortfolioDocument } from '@/modules/portfolio-document';

import { PRIVATE_PAGE_PASSWORD_REDACTION } from '../constants/private-page-redaction.constants';

/** Replace server credentials before a draft crosses the React client boundary. */
export function redactPrivatePagePasswords(document: PortfolioDocument): PortfolioDocument {
  return {
    ...document,
    pages: document.pages.map((page) => ({
      ...page,
      passwordHash: page.visibility === 'private' ? PRIVATE_PAGE_PASSWORD_REDACTION : null,
    })),
  };
}

/**
 * Page access is controlled only by its owner action. A normal draft save
 * preserves the current server values and cannot inject, clear, or overwrite a
 * password hash supplied by an untrusted browser.
 */
export function restoreServerPageAccess(
  incoming: PortfolioDocument,
  current: PortfolioDocument,
): PortfolioDocument {
  return {
    ...incoming,
    pages: incoming.pages.map((page) => {
      const stored = current.pages.find((candidate) => candidate.id === page.id);
      return stored === undefined
        ? { ...page, visibility: 'public', passwordHash: null }
        : {
            ...page,
            visibility: stored.visibility,
            passwordHash: stored.passwordHash,
          };
    }),
  };
}
