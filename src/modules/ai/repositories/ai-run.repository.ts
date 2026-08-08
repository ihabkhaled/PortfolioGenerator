import 'server-only';

import { getDatabase } from '@/packages/database';

import type { AiRunInput } from '../types/ai-run.types';

/**
 * One row per model call.
 *
 * Enough to answer "what does a successful extraction cost and how often do we
 * escalate" without building a finance subsystem — and deliberately holding no
 * prompt text, no completion text and no secrets. This table is queried during
 * incidents by people who should not thereby gain access to anyone's CV.
 */
export async function recordAiRun(input: AiRunInput): Promise<void> {
  await getDatabase().aiRun.create({
    data: {
      ownerId: input.ownerId,
      portfolioId: input.portfolioId,
      resumeUploadId: input.resumeUploadId,
      operation: input.operation,
      provider: input.provider,
      model: input.model,
      status: input.status,
      inputUnits: input.inputUnits,
      outputUnits: input.outputUnits,
      latencyMs: input.latencyMs,
      retryCount: input.retryCount,
      fallbackUsed: input.fallbackUsed,
      errorCode: input.errorCode,
    },
  });
}
