'use server';

import { requireOwner } from '@/modules/auth/server';
import { portfolioDocumentSchema } from '@/modules/portfolio-document';
import { invalidatePath } from '@/packages/cache';
import { parseSchema } from '@/packages/zod';
import { buildDashboardEditorPath } from '@/shared/constants/route-paths.constants';

import {
  TRANSLATION_ACTION_ERROR_KEY,
  TRANSLATION_ACTION_FIELDS,
} from '../constants/translation-action.constants';
import { translationErrorKey } from '../helpers/translation-error-key.helper';
import {
  translationActionSchema,
  translationCorrectionActionSchema,
  versionedTranslationActionSchema,
} from '../schemas/translation-action.schema';
import {
  correctTranslationDraft,
  generateTranslationDraft,
  markTranslationReviewed,
  publishTranslationSnapshot,
} from '../services/translation.service';
import type { TranslationActionInput, TranslationActionState } from '../types/translation.types';

function readInput(formData: FormData): TranslationActionInput {
  return {
    portfolioId: formData.get(TRANSLATION_ACTION_FIELDS.portfolioId),
    locale: formData.get(TRANSLATION_ACTION_FIELDS.locale),
  };
}

export async function correctTranslationAction(
  _previous: TranslationActionState,
  formData: FormData,
): Promise<TranslationActionState> {
  const owner = await requireOwner();
  const parsed = parseSchema(translationCorrectionActionSchema, {
    ...readInput(formData),
    expectedVersion: formData.get(TRANSLATION_ACTION_FIELDS.expectedVersion),
    document: formData.get(TRANSLATION_ACTION_FIELDS.document),
  });
  if (!parsed.ok) return resultState(false);
  let decoded: unknown;
  try {
    decoded = JSON.parse(parsed.value.document);
  } catch {
    return resultState(false);
  }
  const document = parseSchema(portfolioDocumentSchema, decoded);
  if (!document.ok) return resultState(false);
  const result = await correctTranslationDraft(
    owner.id,
    parsed.value.portfolioId,
    parsed.value.locale,
    parsed.value.expectedVersion,
    document.value,
  );
  if (result.ok) invalidatePath(buildDashboardEditorPath(parsed.value.portfolioId));
  return resultState(result.ok);
}

function resultState(ok: boolean): TranslationActionState {
  return ok
    ? { status: 'success', error: null }
    : { status: 'error', error: TRANSLATION_ACTION_ERROR_KEY };
}

export async function generateTranslationAction(
  _previous: TranslationActionState,
  formData: FormData,
): Promise<TranslationActionState> {
  const owner = await requireOwner();
  const parsed = parseSchema(translationActionSchema, readInput(formData));
  if (!parsed.ok) return resultState(false);
  const result = await generateTranslationDraft(
    owner.id,
    parsed.value.portfolioId,
    parsed.value.locale,
  );
  if (result.ok) invalidatePath(buildDashboardEditorPath(parsed.value.portfolioId));
  return result.ok
    ? resultState(true)
    : {
        status: 'error',
        error: translationErrorKey(result.reason),
      };
}

export async function reviewTranslationAction(
  _previous: TranslationActionState,
  formData: FormData,
): Promise<TranslationActionState> {
  const owner = await requireOwner();
  const parsed = parseSchema(versionedTranslationActionSchema, {
    ...readInput(formData),
    expectedVersion: formData.get(TRANSLATION_ACTION_FIELDS.expectedVersion),
  });
  if (!parsed.ok) return resultState(false);
  const result = await markTranslationReviewed(
    owner.id,
    parsed.value.portfolioId,
    parsed.value.locale,
    parsed.value.expectedVersion,
    new Date(),
  );
  if (result.ok) invalidatePath(buildDashboardEditorPath(parsed.value.portfolioId));
  return resultState(result.ok);
}

export async function publishTranslationAction(
  _previous: TranslationActionState,
  formData: FormData,
): Promise<TranslationActionState> {
  const owner = await requireOwner();
  const parsed = parseSchema(versionedTranslationActionSchema, {
    ...readInput(formData),
    expectedVersion: formData.get(TRANSLATION_ACTION_FIELDS.expectedVersion),
  });
  if (!parsed.ok) return resultState(false);
  const result = await publishTranslationSnapshot(
    owner.id,
    parsed.value.portfolioId,
    parsed.value.locale,
    parsed.value.expectedVersion,
    new Date(),
  );
  if (result.ok) invalidatePath(buildDashboardEditorPath(parsed.value.portfolioId));
  return resultState(result.ok);
}
