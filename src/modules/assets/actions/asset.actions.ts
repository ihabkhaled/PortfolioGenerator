'use server';

import { requireOwner } from '@/modules/auth/server';
import type { UploadPurpose } from '@/modules/file-security';
import { getOwnedPortfolio } from '@/modules/portfolios/server';
import { consumeUploadIpQuota } from '@/modules/rate-limit/server';
import { getClientAddress } from '@/packages/headers';

import { UPLOAD_PURPOSE_SET } from '../constants/asset.constants';
import { uploadOwnedAsset } from '../services/asset-upload.service';
import type { AssetUploadFormState } from '../types/asset-form.types';

export async function uploadAssetAction(
  _previous: AssetUploadFormState,
  formData: FormData,
): Promise<AssetUploadFormState> {
  const owner = await requireOwner();
  const portfolioId = formData.get('portfolioId');
  const purpose = formData.get('purpose');

  if (
    typeof portfolioId !== 'string' ||
    typeof purpose !== 'string' ||
    purpose === 'resume' ||
    !UPLOAD_PURPOSE_SET.has(purpose as UploadPurpose)
  ) {
    return { status: 'error', error: 'invalid-input' };
  }

  const portfolio = await getOwnedPortfolio(owner.id, portfolioId);

  if (portfolio === null) {
    return { status: 'error', error: 'not-found' };
  }

  const quota = await consumeUploadIpQuota(await getClientAddress(), new Date());
  if (!quota.allowed) return { status: 'error', error: 'rate-limited' };

  const file = formData.get('asset');

  if (!(file instanceof File)) {
    return { status: 'error', error: 'invalid-input' };
  }

  const outcome = await uploadOwnedAsset({
    ownerId: owner.id,
    portfolioId,
    purpose: purpose as UploadPurpose,
    visibility: 'public',
    fileName: file.name,
    declaredContentType: file.type,
    bytes: new Uint8Array(await file.arrayBuffer()),
  });

  if (!outcome.ok) {
    return outcome.reason === 'not-found'
      ? { status: 'error', error: 'not-found' }
      : { status: 'error', error: outcome.rejection };
  }

  return { status: 'success', asset: outcome.asset };
}
