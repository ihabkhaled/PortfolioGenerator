'use server';

import { requireOwner } from '@/modules/auth/server';

import { PRIVATE_PAGE_OWNER_FIELDS } from '../constants/private-page-owner.constants';
import { parsePrivatePageOwnerInput } from '../schemas/private-page-owner.schema';
import { setOwnedPrivatePageAccess } from '../services/private-page-owner.service';
import type { PrivatePageOwnerActionState } from '../types/private-page-owner.types';

export async function setPrivatePageAccessAction(
  _previous: PrivatePageOwnerActionState,
  formData: FormData,
): Promise<PrivatePageOwnerActionState> {
  const owner = await requireOwner();
  const parsed = parsePrivatePageOwnerInput({
    portfolioId: formData.get(PRIVATE_PAGE_OWNER_FIELDS.portfolioId),
    pageId: formData.get(PRIVATE_PAGE_OWNER_FIELDS.pageId),
    expectedVersion: formData.get(PRIVATE_PAGE_OWNER_FIELDS.expectedVersion),
    visibility: formData.get(PRIVATE_PAGE_OWNER_FIELDS.visibility),
    password: formData.get(PRIVATE_PAGE_OWNER_FIELDS.password),
  });

  if (!parsed.ok) {
    return { status: 'error', error: 'invalid-input', version: null };
  }

  return setOwnedPrivatePageAccess({ ownerId: owner.id, ...parsed.value });
}
