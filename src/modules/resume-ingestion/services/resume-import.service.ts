import 'server-only';

import { createHash } from 'node:crypto';

import { extractResumeToDraft } from '@/modules/ai/server';
import { recordAuditEvent } from '@/modules/audit/server';
import { inspectAndScan } from '@/modules/file-security/server';
import { consumeAiOperationQuota, consumePlatformAiBudget } from '@/modules/rate-limit/server';
import { EXTRACTED_TEXT_KEY_PREFIX, RESUME_KEY_PREFIX, TEXT_CONTENT_TYPE } from '@/modules/storage';
import { generateStorageKey, getObjectStorage } from '@/modules/storage/server';
import { getServerEnv } from '@/packages/env/server';
import { logger } from '@/packages/logger';
import { extractPdfText } from '@/packages/pdf';

import { WARNING_CODES } from '../constants/import-warning.constants';
import { normalizeResumeText } from '../helpers/resume-text.helper';
import { validateUpload } from '../policies/pdf-validation.policy';
import { toUploadRejection } from '../policies/upload-rejection.policy';
import {
  createResumeUpload,
  updateOwnedResumeUpload,
} from '../repositories/resume-upload.repository';
import type { ExtractionWarning } from '../types/ingestion.types';
import type { ResumeImportRequest, ResumeImportOutcome } from '../types/resume-import.types';

/**
 * The import pipeline.
 *
 * The order is the cost and safety design: validate the bytes, store them
 * privately, extract text locally, and only then — if there is text worth
 * sending — spend a model call. Quotas are consumed before the model, never
 * after; a quota checked after the call has been paid for is not a quota.
 *
 * Every state is persisted as it is reached, so a user who refreshes mid-import
 * sees where their upload actually is instead of a spinner that has forgotten.
 */
export async function importResume(request: ResumeImportRequest): Promise<ResumeImportOutcome> {
  const env = getServerEnv();
  const storage = getObjectStorage();

  const rejection = validateUpload({
    bytes: request.bytes,
    sizeBytes: request.bytes.length,
    maxBytes: env.UPLOAD_MAX_BYTES,
  });

  if (rejection !== null) {
    return { ok: false, rejection };
  }

  /*
   * The full gate: extension, declared type and magic bytes must agree, and
   * the bytes must survive a virus scan.
   *
   * It runs before anything is written, so an infected file never reaches
   * object storage, never gets a row, and never gets a storage key that some
   * later code path could serve. The PDF check above stays: it is cheap, it
   * runs first, and it produces the specific message a user who uploaded a
   * Word document actually needs.
   */
  const inspection = await inspectAndScan(
    {
      fileName: request.originalFilename,
      declaredContentType: request.declaredContentType,
      bytes: request.bytes,
    },
    'document',
    env.UPLOAD_MAX_BYTES,
  );

  if (!inspection.ok) {
    await recordAuditEvent({
      eventType: 'resume.rejected',
      ownerId: request.ownerId,
      portfolioId: request.portfolioId,
      metadata: { rejection: inspection.rejection, detail: inspection.detail },
    });

    return { ok: false, rejection: toUploadRejection(inspection.rejection) };
  }

  const sha256 = createHash('sha256').update(request.bytes).digest('hex');
  const storageKey = generateStorageKey(request.ownerId, RESUME_KEY_PREFIX);

  await storage.putPrivate(storageKey, request.bytes, inspection.contentType);

  const upload = await createResumeUpload({
    ownerId: request.ownerId,
    portfolioId: request.portfolioId,
    storageKey,
    originalFilename: request.originalFilename,
    // Recorded as what we verified it to be, not as what the browser claimed.
    mimeType: inspection.contentType,
    sizeBytes: request.bytes.length,
    sha256,
    status: 'VALIDATED',
  });

  await recordAuditEvent({
    eventType: 'resume.uploaded',
    ownerId: request.ownerId,
    portfolioId: request.portfolioId,
    metadata: { uploadId: upload.id, sizeBytes: request.bytes.length },
  });

  const warnings: ExtractionWarning[] = [];
  let normalized;

  try {
    const extracted = await extractPdfText(request.bytes);

    normalized = normalizeResumeText(
      extracted.text,
      extracted.pageCount,
      env.EXTRACTION_MAX_INPUT_CHARS,
    );
  } catch {
    await updateOwnedResumeUpload(request.ownerId, upload.id, {
      status: 'FAILED_TEXT_EXTRACTION',
      errorCode: 'text-extraction-failed',
    });

    return { ok: false, rejection: 'not-a-pdf', uploadId: upload.id };
  }

  if (normalized.pageCount > env.UPLOAD_MAX_PAGES) {
    await updateOwnedResumeUpload(request.ownerId, upload.id, {
      status: 'FAILED_VALIDATION',
      pageCount: normalized.pageCount,
      errorCode: 'too-many-pages',
    });

    return { ok: false, rejection: 'too-many-pages', uploadId: upload.id };
  }

  // A scanned document has no text layer, and OCR is off by default. Telling
  // the user that plainly beats sending an empty page to a model and handing
  // back an empty draft they cannot explain.
  if (normalized.looksScanned && !env.OCR_ENABLED) {
    await updateOwnedResumeUpload(request.ownerId, upload.id, {
      status: 'FAILED_TEXT_EXTRACTION',
      pageCount: normalized.pageCount,
      characterCount: normalized.characterCount,
      errorCode: 'looks-scanned',
    });

    return { ok: false, rejection: 'not-a-pdf', uploadId: upload.id, looksScanned: true };
  }

  if (normalized.wasTruncated) {
    warnings.push({
      code: WARNING_CODES.truncatedInput,
      path: '',
      message: 'The document was long, so only its first part was read.',
    });
  }

  const textKey = generateStorageKey(request.ownerId, EXTRACTED_TEXT_KEY_PREFIX);

  await storage.putPrivate(textKey, new TextEncoder().encode(normalized.text), TEXT_CONTENT_TYPE);

  await updateOwnedResumeUpload(request.ownerId, upload.id, {
    status: 'TEXT_EXTRACTED',
    pageCount: normalized.pageCount,
    characterCount: normalized.characterCount,
    extractedTextStorageKey: textKey,
  });

  await recordAuditEvent({
    eventType: 'resume.text_extracted',
    ownerId: request.ownerId,
    portfolioId: request.portfolioId,
    metadata: {
      uploadId: upload.id,
      pageCount: normalized.pageCount,
      characterCount: normalized.characterCount,
    },
  });

  const quota = await consumeAiOperationQuota(request.ownerId, request.now);

  if (!quota.allowed) {
    await updateOwnedResumeUpload(request.ownerId, upload.id, {
      status: 'FAILED_AI',
      errorCode: 'quota-exceeded',
    });

    return { ok: false, rejection: 'quota-exceeded', uploadId: upload.id };
  }

  if (!(await consumePlatformAiBudget(request.now))) {
    await updateOwnedResumeUpload(request.ownerId, upload.id, {
      status: 'FAILED_AI',
      errorCode: 'budget-exceeded',
    });

    return { ok: false, rejection: 'rate-limited', uploadId: upload.id };
  }

  await updateOwnedResumeUpload(request.ownerId, upload.id, { status: 'AI_STRUCTURING' });
  await recordAuditEvent({
    eventType: 'ai.extraction.started',
    ownerId: request.ownerId,
    portfolioId: request.portfolioId,
    metadata: { uploadId: upload.id },
  });

  const extraction = await extractResumeToDraft({
    ownerId: request.ownerId,
    portfolioId: request.portfolioId,
    resumeUploadId: upload.id,
    resumeText: normalized.text,
    displayNameFallback: request.displayNameFallback,
    pipelineWarnings: warnings,
  });

  if (!extraction.ok) {
    await updateOwnedResumeUpload(request.ownerId, upload.id, {
      status: 'FAILED_AI',
      errorCode: extraction.errorCode,
    });

    await recordAuditEvent({
      eventType: 'ai.extraction.failed',
      ownerId: request.ownerId,
      portfolioId: request.portfolioId,
      metadata: { uploadId: upload.id, errorCode: extraction.errorCode },
    });

    return { ok: false, rejection: 'rate-limited', uploadId: upload.id };
  }

  await updateOwnedResumeUpload(request.ownerId, upload.id, {
    status: 'NEEDS_REVIEW',
    warnings: extraction.warnings,
  });

  await recordAuditEvent({
    eventType: 'ai.extraction.succeeded',
    ownerId: request.ownerId,
    portfolioId: request.portfolioId,
    metadata: { uploadId: upload.id, warningCount: extraction.warnings.length },
  });

  logger.info('resume.import.completed', {
    portfolioId: request.portfolioId,
    uploadId: upload.id,
    warningCount: extraction.warnings.length,
  });

  return {
    ok: true,
    uploadId: upload.id,
    document: extraction.document,
    warnings: extraction.warnings,
  };
}
