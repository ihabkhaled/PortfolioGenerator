import 'server-only';

import { getOwnedPortfolio, saveDraftDocument } from '@/modules/portfolios/server';

import {
  canSetDocumentPageAccess,
  setDocumentPageAccess,
} from '../helpers/private-page-owner.helper';
import { hashPrivatePagePassword } from '../helpers/private-page-password.helper';
import type {
  PrivatePageOwnerActionState,
  SetPrivatePageAccessInput,
} from '../types/private-page-owner.types';

export async function setOwnedPrivatePageAccess(
  input: SetPrivatePageAccessInput,
): Promise<PrivatePageOwnerActionState> {
  const portfolio = await getOwnedPortfolio(input.ownerId, input.portfolioId);

  if (portfolio === null) {
    return { status: 'error', error: 'not-found', version: null };
  }

  if (portfolio.draftVersion !== input.expectedVersion) {
    return { status: 'error', error: 'version-conflict', version: portfolio.draftVersion };
  }

  if (!canSetDocumentPageAccess(portfolio.draftDocument, input.pageId, input.visibility)) {
    return { status: 'error', error: 'invalid-input', version: null };
  }

  const passwordHash =
    input.visibility === 'private' ? await hashPrivatePagePassword(input.password) : null;
  const document = setDocumentPageAccess(
    portfolio.draftDocument,
    input.pageId,
    input.visibility,
    passwordHash,
  );

  if (document === null) {
    return { status: 'error', error: 'invalid-input', version: null };
  }

  const saved = await saveDraftDocument({
    ownerId: input.ownerId,
    portfolioId: input.portfolioId,
    expectedVersion: input.expectedVersion,
    document,
  });

  if (!saved.ok) {
    return {
      status: 'error',
      error: saved.reason === 'version-conflict' ? 'version-conflict' : 'not-found',
      version: saved.reason === 'version-conflict' ? saved.currentVersion : null,
    };
  }

  return { status: 'success', error: null, version: saved.value.draftVersion };
}
