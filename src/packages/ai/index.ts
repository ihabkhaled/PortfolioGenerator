import 'server-only';

import { createOpenAI } from '@ai-sdk/openai';
import { generateText, NoOutputGeneratedError, Output } from 'ai';

import type { StructuredRequest, StructuredResponse } from './ai.types';

/**
 * Owner of the AI SDK.
 *
 * Everything vendor-specific lives here: the client construction, the
 * structured-output call, and the reduction of a provider response to what may
 * be stored. The rest of the application talks to `PortfolioAiProvider`, which
 * mentions no vendor at all.
 *
 * An OpenAI-*compatible* client rather than a provider-specific one, because
 * the base URL is configuration: the same code path reaches OpenAI, an AI
 * gateway, or a self-hosted endpoint, so switching is an environment change
 * rather than a deploy.
 */

export function createStructuredClient(config: {
  readonly apiKey: string;
  readonly baseUrl: string | undefined;
}): (request: StructuredRequest) => Promise<StructuredResponse> {
  const openai = createOpenAI({
    apiKey: config.apiKey,
    ...(config.baseUrl !== undefined && { baseURL: config.baseUrl }),
  });

  return async (request) => {
    const startedAt = performance.now();

    try {
      const result = await generateText({
        model: openai(request.model),
        // `generateText` with a structured `output` rather than the deprecated
        // `generateObject`: same guarantee, and the one the SDK still supports.
        output: Output.object({ schema: request.schema }),
        system: request.systemPrompt,
        prompt: request.userPrompt,
        maxOutputTokens: request.maxOutputTokens,
        abortSignal: AbortSignal.timeout(request.timeoutMs),
        // Zero temperature: this is transcription, not writing. Sampling
        // variety in an extraction pipeline is variance in someone's
        // employment dates.
        temperature: 0,
      });

      return {
        ok: true,
        value: result.output,
        model: request.model,
        inputUnits: result.usage.inputTokens ?? null,
        outputUnits: result.usage.outputTokens ?? null,
        latencyMs: Math.round(performance.now() - startedAt),
      };
    } catch (error) {
      return {
        ok: false,
        // A model that produced unparseable or schema-violating output is a
        // different failure from a network error: the first is worth one
        // targeted retry, the second is worth backing off.
        errorCode: NoOutputGeneratedError.isInstance(error) ? 'invalid-output' : 'provider-error',
        model: request.model,
        inputUnits: null,
        outputUnits: null,
        latencyMs: Math.round(performance.now() - startedAt),
      };
    }
  };
}
