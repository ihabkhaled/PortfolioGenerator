'use server';

import { requireOwner } from '@/modules/auth/server';
import { saveDraftDocument } from '@/modules/portfolios/server';
import { claimSlug, publishPortfolio, unpublishPortfolio } from '@/modules/publishing/server';
import { logger } from '@/packages/logger';
import { parseSchema } from '@/packages/zod';

import { EDITOR_ERROR_KEYS } from '../constants/editor.constants';
import { claimSlugSchema, portfolioIdSchema, saveDraftSchema } from '../schemas/editor.schema';
import type { EditorActionState, SaveDraftPayload } from '../types/editor.types';

/**
 * The editor's server actions.
 *
 * Each one resolves the owner first and passes only an owner id downstream. A
 * server action is a public HTTP endpoint with a friendly signature: nothing
 * here may assume it was reached from a page that already checked.
 */

export async function saveDraftAction(payload: SaveDraftPayload): Promise<EditorActionState> {
  const owner = await requireOwner();
  const parsed = parseSchema(saveDraftSchema, payload);

  if (!parsed.ok) {
    logger.info('editor.save.invalid_document');

    return { status: 'error', error: EDITOR_ERROR_KEYS.invalidDocument, version: null };
  }

  const saved = await saveDraftDocument({
    ownerId: owner.id,
    portfolioId: parsed.value.portfolioId,
    expectedVersion: parsed.value.expectedVersion,
    document: parsed.value.document,
  });

  if (!saved.ok) {
    // A version conflict is recoverable by reloading and is the user's problem
    // to resolve; "not found" means the id is not theirs, and is deliberately
    // not distinguished from "deleted" in the message.
    return {
      status: 'error',
      error:
        saved.reason === 'version-conflict'
          ? EDITOR_ERROR_KEYS.versionConflict
          : EDITOR_ERROR_KEYS.notFound,
      version: saved.reason === 'version-conflict' ? saved.currentVersion : null,
    };
  }

  return { status: 'saved', error: null, version: saved.value.draftVersion };
}

export async function claimSlugAction(
  _previous: EditorActionState,
  formData: FormData,
): Promise<EditorActionState> {
  const owner = await requireOwner();
  const parsed = parseSchema(claimSlugSchema, {
    portfolioId: formData.get('portfolioId'),
    slug: formData.get('slug'),
  });

  if (!parsed.ok) {
    return { status: 'error', error: EDITOR_ERROR_KEYS.invalidSlug, version: null };
  }

  const result = await claimSlug(owner.id, parsed.value.portfolioId, parsed.value.slug);

  if (!result.ok) {
    return { status: 'error', error: EDITOR_ERROR_KEYS[result.failure], version: null };
  }

  return { status: 'saved', error: null, version: null };
}

export async function publishAction(
  _previous: EditorActionState,
  formData: FormData,
): Promise<EditorActionState> {
  const owner = await requireOwner();
  const parsed = parseSchema(portfolioIdSchema, { portfolioId: formData.get('portfolioId') });

  if (!parsed.ok) {
    return { status: 'error', error: EDITOR_ERROR_KEYS.notFound, version: null };
  }

  const result = await publishPortfolio({
    ownerId: owner.id,
    portfolioId: parsed.value.portfolioId,
    now: new Date(),
  });

  if (!result.ok) {
    return {
      status: 'error',
      error: EDITOR_ERROR_KEYS[result.failure],
      version: null,
      blockers: result.blockers ?? [],
    };
  }

  return { status: 'published', error: null, version: null, slug: result.slug };
}

export async function unpublishAction(
  _previous: EditorActionState,
  formData: FormData,
): Promise<EditorActionState> {
  const owner = await requireOwner();
  const parsed = parseSchema(portfolioIdSchema, { portfolioId: formData.get('portfolioId') });

  if (!parsed.ok) {
    return { status: 'error', error: EDITOR_ERROR_KEYS.notFound, version: null };
  }

  const result = await unpublishPortfolio({
    ownerId: owner.id,
    portfolioId: parsed.value.portfolioId,
    now: new Date(),
  });

  if (!result.ok) {
    return { status: 'error', error: EDITOR_ERROR_KEYS[result.failure], version: null };
  }

  return { status: 'unpublished', error: null, version: null };
}
