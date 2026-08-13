'use server';

import { requireOwner } from '@/modules/auth/server';
import { getOwnedPortfolio, saveDraftDocument } from '@/modules/portfolios/server';
import {
  consumeResumeImportQuota,
  consumeUploadIpQuota,
  releaseResumeImportQuota,
} from '@/modules/rate-limit/server';
import { getClientAddress } from '@/packages/headers';
import { toAppRoute } from '@/packages/link';
import { logger } from '@/packages/logger';
import { appRedirect } from '@/packages/navigation';
import { buildDashboardEditorPath } from '@/shared/constants/route-paths.constants';

import { IMPORT_REJECTION_KEYS } from '../constants/import-form.constants';
import { importResume } from '../services/resume-import.service';
import type { ImportFormState } from '../types/import-form.types';

/**
 * The CV upload entry point.
 *
 * Order matters and is the whole point: authorize, then rate-limit, then read
 * the bytes. Reading an 8 MB body before deciding whether the caller is allowed
 * to upload at all is how a rate limit becomes decorative.
 *
 * The IP limit is a secondary signal — it is forgeable — so it is checked
 * alongside the per-user quota rather than instead of it.
 */
export async function importResumeAction(
  _previous: ImportFormState,
  formData: FormData,
): Promise<ImportFormState> {
  const owner = await requireOwner();
  const portfolioId = formData.get('portfolioId');

  if (typeof portfolioId !== 'string') {
    return { status: 'error', error: IMPORT_REJECTION_KEYS.invalid, warnings: [] };
  }

  const portfolio = await getOwnedPortfolio(owner.id, portfolioId);

  if (portfolio === null) {
    return { status: 'error', error: IMPORT_REJECTION_KEYS.notFound, warnings: [] };
  }

  const now = new Date();
  const address = await getClientAddress();
  const ipQuota = await consumeUploadIpQuota(address, now);

  if (!ipQuota.allowed) {
    logger.warn('resume.upload.ip_rate_limited');

    return { status: 'error', error: IMPORT_REJECTION_KEYS['rate-limited'], warnings: [] };
  }

  const importQuota = await consumeResumeImportQuota(owner.id, now);

  if (!importQuota.allowed) {
    return { status: 'error', error: IMPORT_REJECTION_KEYS['quota-exceeded'], warnings: [] };
  }

  const file = formData.get('resume');

  if (!(file instanceof File)) {
    return { status: 'error', error: IMPORT_REJECTION_KEYS.invalid, warnings: [] };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  let outcome;

  try {
    outcome = await importResume({
      ownerId: owner.id,
      portfolioId,
      bytes,
      originalFilename: file.name,
      declaredContentType: file.type,
      displayNameFallback: owner.name,
      now,
    });
  } catch (error) {
    await releaseResumeImportQuota(owner.id, now);
    throw error;
  }

  if (!outcome.ok) {
    await releaseResumeImportQuota(owner.id, now);
    return {
      status: 'error',
      error:
        outcome.looksScanned === true
          ? IMPORT_REJECTION_KEYS.scanned
          : IMPORT_REJECTION_KEYS[outcome.rejection],
      warnings: [],
    };
  }

  // The import result is a *draft*, never a publication. It lands on the same
  // optimistic-concurrency path as a manual edit, so an import racing an open
  // editor tab is rejected rather than silently overwriting.
  const saved = await saveDraftDocument({
    ownerId: owner.id,
    portfolioId,
    expectedVersion: portfolio.draftVersion,
    document: outcome.document,
  });

  if (!saved.ok) {
    return { status: 'error', error: IMPORT_REJECTION_KEYS.conflict, warnings: [] };
  }

  appRedirect(toAppRoute(buildDashboardEditorPath(portfolioId)));
}
