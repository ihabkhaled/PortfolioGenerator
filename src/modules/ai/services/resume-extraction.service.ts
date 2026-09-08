import 'server-only';

import { getServerEnv } from '@/packages/env/server';
import { logger } from '@/packages/logger';

import { AI_OPERATIONS, EXTRACTION_CHAIN_BUDGET_MS } from '../constants/extraction.constants';
import { resolveModelChain } from '../helpers/model-chain.helper';
import { mapExtractionToDocument } from '../mappers/extraction-to-document.mapper';
import { isRetryable, toAiRunStatus } from '../policies/ai-run-status.policy';
import { recordAiRun } from '../repositories/ai-run.repository';
import type { ExtractionRequest, ExtractionOutcome } from '../types/extraction-service.types';

import { getAiProvider } from './ai-provider.service';

/**
 * One import, from normalized text to a validated draft.
 *
 * The retry shape is the cost design made concrete. A normal CV costs exactly
 * one call. A failure walks the configured model chain, one model per attempt,
 * because the failures worth surviving are per-model: output the schema
 * rejects, a parameter one endpoint refuses, a model the provider retired, a
 * single model's rate limit. A provider that is misconfigured earns no retry
 * at all, because no model fixes a missing key.
 *
 * Bounded twice over — by the length of the chain, and by a wall-clock budget,
 * since a chain long enough to be useful is also long enough to outlive the
 * platform's own request limit if every model times out.
 *
 * Every attempt is recorded whether it succeeded or not. A cost-per-extraction
 * figure that only counts successes is a number that flatters us.
 */
export async function extractResumeToDraft(request: ExtractionRequest): Promise<ExtractionOutcome> {
  const provider = getAiProvider();
  const startedAt = Date.now();
  const env = getServerEnv();
  const chainLength = resolveModelChain(
    env.AI_MODEL_CHAIN,
    env.AI_PRIMARY_MODEL,
    env.AI_FALLBACK_MODEL,
  ).length;
  let attempt = 0;
  let lastErrorCode: string | null = null;
  let lastFailureReason: string | null = null;

  while (attempt < chainLength) {
    const result = await provider.extractResume({
      resumeText: request.resumeText,
      modelIndex: attempt,
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
        fallbackUsed: attempt > 0,
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
      fallbackUsed: attempt > 0,
      errorCode: result.errorCode,
    });

    lastErrorCode = result.errorCode;
    lastFailureReason = result.failureReason;

    if (!isRetryable(result.errorCode)) {
      break;
    }

    if (Date.now() - startedAt >= EXTRACTION_CHAIN_BUDGET_MS) {
      break;
    }

    attempt += 1;
  }

  logger.warn('ai.extraction.exhausted', {
    portfolioId: request.portfolioId,
    attempts: attempt + 1,
    errorCode: lastErrorCode,
    failureReason: lastFailureReason,
  });

  return { ok: false, errorCode: lastErrorCode ?? 'provider-error' };
}
