import 'server-only';

import { logger } from '@/packages/logger';

import { AI_OPERATIONS, MAX_EXTRACTION_ATTEMPTS } from '../constants/extraction.constants';
import { mapExtractionToDocument } from '../mappers/extraction-to-document.mapper';
import { isRetryable, shouldEscalate, toAiRunStatus } from '../policies/ai-run-status.policy';
import { recordAiRun } from '../repositories/ai-run.repository';
import type { ExtractionRequest, ExtractionOutcome } from '../types/extraction-service.types';

import { getAiProvider } from './ai-provider.service';

/**
 * One import, from normalized text to a validated draft.
 *
 * The retry shape is the cost design made concrete. A normal CV costs exactly
 * one call. A model that returns something the schema rejects earns one more
 * attempt on the stronger model — because that is the failure a bigger model
 * actually fixes. A provider that is misconfigured earns none, because it will
 * not have fixed itself a second later.
 *
 * Every attempt is recorded whether it succeeded or not. A cost-per-extraction
 * figure that only counts successes is a number that flatters us.
 */
export async function extractResumeToDraft(request: ExtractionRequest): Promise<ExtractionOutcome> {
  const provider = getAiProvider();
  let attempt = 0;
  let lastErrorCode: string | null = null;

  while (attempt < MAX_EXTRACTION_ATTEMPTS) {
    const useFallbackModel = attempt > 0;
    const result = await provider.extractResume({
      resumeText: request.resumeText,
      useFallbackModel,
    });

    if (result.ok) {
      await recordAiRun({
        ownerId: request.ownerId,
        portfolioId: request.portfolioId,
        resumeUploadId: request.resumeUploadId,
        operation: AI_OPERATIONS.extractResume,
        provider: result.usage.provider,
        model: result.usage.model,
        status: 'SUCCEEDED',
        inputUnits: result.usage.inputUnits,
        outputUnits: result.usage.outputUnits,
        latencyMs: result.usage.latencyMs,
        retryCount: attempt,
        fallbackUsed: useFallbackModel,
        errorCode: null,
      });

      const mapped = mapExtractionToDocument(
        result.value,
        request.displayNameFallback,
        request.resumeUploadId,
      );

      return {
        ok: true,
        document: mapped.document,
        warnings: [...mapped.warnings, ...request.pipelineWarnings],
      };
    }

    await recordAiRun({
      ownerId: request.ownerId,
      portfolioId: request.portfolioId,
      resumeUploadId: request.resumeUploadId,
      operation: AI_OPERATIONS.extractResume,
      provider: result.usage.provider,
      model: result.usage.model,
      status: toAiRunStatus(result.errorCode),
      inputUnits: result.usage.inputUnits,
      outputUnits: result.usage.outputUnits,
      latencyMs: result.usage.latencyMs,
      retryCount: attempt,
      fallbackUsed: useFallbackModel,
      errorCode: result.errorCode,
    });

    lastErrorCode = result.errorCode;

    if (!isRetryable(result.errorCode)) {
      break;
    }

    if (!shouldEscalate(result.errorCode, attempt) && attempt >= 1) {
      break;
    }

    attempt += 1;
  }

  logger.warn('ai.extraction.exhausted', {
    portfolioId: request.portfolioId,
    attempts: attempt + 1,
    errorCode: lastErrorCode,
  });

  return { ok: false, errorCode: lastErrorCode ?? 'provider-error' };
}
