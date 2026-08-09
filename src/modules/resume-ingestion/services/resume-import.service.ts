import 'server-only';

import { createHash } from 'node:crypto';

import { extractResumeToDraft } from '@/modules/ai/server';
import { storeScannedResumeAsset } from '@/modules/assets/server';
import { recordAuditEvent } from '@/modules/audit/server';
import { inspectAndScanForPurpose } from '@/modules/file-security/server';
import { getOwnedPortfolio } from '@/modules/portfolios/server';
import { consumeAiOperationQuota, consumePlatformAiBudget } from '@/modules/rate-limit/server';
import { EXTRACTED_TEXT_KEY_PREFIX, RESUME_KEY_PREFIX, TEXT_CONTENT_TYPE } from '@/modules/storage';
import { generateStorageKey, getObjectStorage } from '@/modules/storage/server';
import {
  DocumentTextError,
  extractDocumentText,
  inspectDocumentForText,
} from '@/packages/document-text';
import { getServerEnv } from '@/packages/env/server';
import { logger } from '@/packages/logger';

import { WARNING_CODES } from '../constants/import-warning.constants';
import { addImportedResumeAttachment } from '../helpers/imported-resume-attachment.helper';
import { normalizeResumeText } from '../helpers/resume-text.helper';
import { toDocumentTextRejection } from '../policies/document-text-rejection.policy';
import { looksEncrypted, validateUploadSize } from '../policies/pdf-validation.policy';
import { shouldRejectScannedResume } from '../policies/scanned-resume.policy';
import { toUploadRejection } from '../policies/upload-rejection.policy';
import {
  createResumeUpload,
  updateOwnedResumeUpload,
} from '../repositories/resume-upload.repository';
import type { ExtractionWarning } from '../types/ingestion.types';
import type {
  ResumeImportOutcome,
  ResumeImportRequest,
  ResumePreflightResult,
} from '../types/resume-import.types';
import type { ResumeUploadRecord } from '../types/resume-upload.types';

async function inspectResumeUpload(request: ResumeImportRequest): Promise<ResumePreflightResult> {
  const sizeRejection = validateUploadSize(request.bytes.length, getServerEnv().UPLOAD_MAX_BYTES);
  if (sizeRejection !== null) return { ok: false, rejection: sizeRejection };

  const inspection = await inspectAndScanForPurpose({
    purpose: 'resume',
    fileName: request.originalFilename,
    declaredContentType: request.declaredContentType,
    bytes: request.bytes,
  });

  if (!inspection.ok) {
    await recordAuditEvent({
      eventType: 'resume.rejected',
      ownerId: request.ownerId,
      portfolioId: request.portfolioId,
      metadata: { rejection: inspection.rejection, detail: inspection.detail },
    });
    return { ok: false, rejection: toUploadRejection(inspection.rejection) };
  }

  if (inspection.contentType === 'application/pdf' && looksEncrypted(request.bytes)) {
    return { ok: false, rejection: 'encrypted' };
  }

  try {
    inspectDocumentForText(request.bytes, inspection.contentType);
  } catch (error) {
    const rejection =
      error instanceof DocumentTextError
        ? toDocumentTextRejection(error.code)
        : 'unreadable-document';
    await recordAuditEvent({
      eventType: 'resume.rejected',
      ownerId: request.ownerId,
      portfolioId: request.portfolioId,
      metadata: { rejection },
    });
    return { ok: false, rejection };
  }

  if ((await getOwnedPortfolio(request.ownerId, request.portfolioId)) === null) {
    return { ok: false, rejection: 'not-found' };
  }

  return { ok: true, inspection };
}

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

  /*
   * The full gate: extension, declared type and magic bytes must agree, and
   * the bytes must survive a virus scan.
   *
   * It runs before anything is written, so an infected file never reaches
   * object storage, never gets a row, and never gets a storage key that some
   * later code path could serve.
   */
  const inspection = await inspectResumeUpload(request);
  if (!inspection.ok) return inspection;

  const sha256 = createHash('sha256').update(request.bytes).digest('hex');
  const storageKey = generateStorageKey(request.ownerId, RESUME_KEY_PREFIX);

  await storage.putPrivate(storageKey, request.bytes, inspection.inspection.contentType);

  let upload: ResumeUploadRecord;

  try {
    upload = await createResumeUpload({
      ownerId: request.ownerId,
      portfolioId: request.portfolioId,
      storageKey,
      originalFilename: request.originalFilename,
      // Recorded as what we verified it to be, not as what the browser claimed.
      mimeType: inspection.inspection.contentType,
      sizeBytes: request.bytes.length,
      sha256,
      status: 'VALIDATED',
    });
  } catch (error) {
    await storage.delete(storageKey);
    throw error;
  }

  await recordAuditEvent({
    eventType: 'resume.uploaded',
    ownerId: request.ownerId,
    portfolioId: request.portfolioId,
    metadata: { uploadId: upload.id, sizeBytes: request.bytes.length },
  });

  const warnings: ExtractionWarning[] = [];
  let normalized;

  let parserWasTruncated: boolean;

  try {
    const extracted = await extractDocumentText({
      bytes: request.bytes,
      contentType: inspection.inspection.contentType,
      maxCharacters: env.EXTRACTION_MAX_INPUT_CHARS,
      maxPages: env.UPLOAD_MAX_PAGES,
    });

    normalized = normalizeResumeText(
      extracted.text,
      extracted.pageCount,
      env.EXTRACTION_MAX_INPUT_CHARS,
    );
    parserWasTruncated = extracted.wasTruncated;
  } catch (error) {
    const extractionRejection =
      error instanceof DocumentTextError
        ? toDocumentTextRejection(error.code)
        : 'unreadable-document';
    await updateOwnedResumeUpload(request.ownerId, upload.id, {
      status:
        extractionRejection === 'too-many-pages' ? 'FAILED_VALIDATION' : 'FAILED_TEXT_EXTRACTION',
      errorCode: extractionRejection,
    });

    return { ok: false, rejection: extractionRejection, uploadId: upload.id };
  }

  // A scanned document has no text layer, and OCR is off by default. Telling
  // the user that plainly beats sending an empty page to a model and handing
  // back an empty draft they cannot explain.
  if (shouldRejectScannedResume(normalized)) {
    await updateOwnedResumeUpload(request.ownerId, upload.id, {
      status: 'FAILED_TEXT_EXTRACTION',
      pageCount: normalized.pageCount,
      characterCount: normalized.characterCount,
      errorCode: 'looks-scanned',
    });

    return { ok: false, rejection: 'unreadable-document', uploadId: upload.id, looksScanned: true };
  }

  if (parserWasTruncated || normalized.wasTruncated) {
    warnings.push({
      code: WARNING_CODES.truncatedInput,
      path: '',
      message: 'The document was long, so only its first part was read.',
    });
  }

  const textKey = generateStorageKey(request.ownerId, EXTRACTED_TEXT_KEY_PREFIX);

  await storage.putPrivate(textKey, new TextEncoder().encode(normalized.text), TEXT_CONTENT_TYPE);

  const textSaved = await updateOwnedResumeUpload(request.ownerId, upload.id, {
    status: 'TEXT_EXTRACTED',
    pageCount: normalized.pageCount,
    characterCount: normalized.characterCount,
    extractedTextStorageKey: textKey,
  });

  if (textSaved === null) {
    await storage.delete(textKey);
    return { ok: false, rejection: 'unreadable-document', uploadId: upload.id };
  }

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

  const resumeAsset = await storeScannedResumeAsset({
    ownerId: request.ownerId,
    portfolioId: request.portfolioId,
    fileName: request.originalFilename,
    bytes: request.bytes,
    inspection: inspection.inspection,
  });

  const document = addImportedResumeAttachment(extraction.document, {
    assetId: resumeAsset.id,
    fileName: resumeAsset.originalFilename,
    contentType: resumeAsset.contentType,
    sizeBytes: resumeAsset.sizeBytes,
  });

  logger.info('resume.import.completed', {
    portfolioId: request.portfolioId,
    uploadId: upload.id,
    warningCount: extraction.warnings.length,
  });

  return {
    ok: true,
    uploadId: upload.id,
    document,
    warnings: extraction.warnings,
  };
}
