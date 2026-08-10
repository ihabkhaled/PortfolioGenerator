import 'server-only';

import { createOpenAI } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';

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
 *
 * Structured output goes through a forced tool call, not `Output.object()` /
 * `response_format: json_schema`. Both are meant to be equivalent, and for
 * OpenAI itself they are — but an OpenAI-*compatible* endpoint is a contract
 * with one vendor's exact behaviour, not the whole surface, and at least one
 * real provider on this code path (Ollama Cloud, a reasoning model) silently
 * ignores `response_format` and answers in plain prose instead of erroring,
 * which `Output.object()` then fails to parse as JSON. Tool calling is older,
 * more universally implemented, and verified against that exact provider: a
 * single tool, forced with `toolChoice`, whose input schema is the requested
 * schema. The model has no way to answer except by "calling" it correctly.
 */

const EXTRACTION_TOOL_NAME = 'report_extracted_data';

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
        system: request.systemPrompt,
        prompt: request.userPrompt,
        tools: {
          [EXTRACTION_TOOL_NAME]: tool({
            description: 'Report the requested data. Call this exactly once, with every field.',
            inputSchema: request.schema,
          }),
        },
        // Forced, not left to the model's judgement: a model that decides to
        // "just answer" instead of calling the tool produces the same
        // unparseable-prose failure this replaces.
        toolChoice: { type: 'tool', toolName: EXTRACTION_TOOL_NAME },
        maxOutputTokens: request.maxOutputTokens,
        abortSignal: AbortSignal.timeout(request.timeoutMs),
        // Zero temperature: this is transcription, not writing. Sampling
        // variety in an extraction pipeline is variance in someone's
        // employment dates.
        temperature: 0,
      });

      const call = result.toolCalls[0];

      if (call === undefined) {
        // The model finished without calling the forced tool at all — a
        // provider- or model-level refusal, not a shape problem with what it
        // said, so this is not the same failure as an invalid payload.
        return {
          ok: false,
          errorCode: 'provider-error',
          model: request.model,
          inputUnits: result.usage.inputTokens ?? null,
          outputUnits: result.usage.outputTokens ?? null,
          latencyMs: Math.round(performance.now() - startedAt),
        };
      }

      return {
        ok: true,
        value: call.input,
        model: request.model,
        inputUnits: result.usage.inputTokens ?? null,
        outputUnits: result.usage.outputTokens ?? null,
        latencyMs: Math.round(performance.now() - startedAt),
      };
    } catch {
      // A malformed tool call (arguments that do not even parse as JSON) is
      // the one failure the SDK still throws for; everything else above is
      // returned, not thrown. Either way there is nothing usable to report.
      return {
        ok: false,
        errorCode: 'invalid-output',
        model: request.model,
        inputUnits: null,
        outputUnits: null,
        latencyMs: Math.round(performance.now() - startedAt),
      };
    }
  };
}
