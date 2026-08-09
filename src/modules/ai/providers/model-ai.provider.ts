import 'server-only';

import { portfolioDocumentSchema, type PortfolioDocument } from '@/modules/portfolio-document';
import { createStructuredClient } from '@/packages/ai';
import { getServerEnv } from '@/packages/env/server';
import { parseSchema } from '@/packages/zod';

import { RESUME_EXTRACTION_SYSTEM_PROMPT } from '../constants/extraction-prompt.constants';
import { MODEL_PROVIDER_NAME } from '../constants/model-provider.constants';
import { PORTFOLIO_TRANSLATION_SYSTEM_PROMPT } from '../constants/translation-prompt.constants';
import { wrapResumeText } from '../helpers/resume-envelope.helper';
import { resumeExtractionSchema } from '../schemas/resume-extraction.schema';
import type {
  AiOutcome,
  PortfolioAiProvider,
  ResumeExtractionInput,
  ResumeExtractionResult,
  PortfolioTranslationInput,
} from '../types/ai-provider.types';

/**
 * The real extraction provider.
 *
 * Model choice is configuration, not code: a cheap model runs first, and the
 * stronger one is reached only when the caller has already seen validation
 * fail. Neither name appears anywhere but the environment.
 *
 * Output is re-validated here even though the provider was given the schema.
 * A schema sent to a model is a request; `parseSchema` is the guarantee, and
 * it is what makes "all model output is untrusted data" true rather than
 * aspirational.
 */
export function createModelAiProvider(): PortfolioAiProvider {
  return {
    name: MODEL_PROVIDER_NAME,

    async extractResume(input: ResumeExtractionInput): Promise<AiOutcome<ResumeExtractionResult>> {
      const env = getServerEnv();
      const model = input.useFallbackModel ? env.AI_FALLBACK_MODEL : env.AI_PRIMARY_MODEL;

      if (env.AI_API_KEY === undefined) {
        return {
          ok: false,
          errorCode: 'not-configured',
          usage: {
            provider: MODEL_PROVIDER_NAME,
            model,
            inputUnits: null,
            outputUnits: null,
            latencyMs: 0,
          },
        };
      }

      const client = createStructuredClient({
        apiKey: env.AI_API_KEY,
        baseUrl: env.AI_BASE_URL,
      });

      const response = await client({
        model,
        schema: resumeExtractionSchema,
        systemPrompt: RESUME_EXTRACTION_SYSTEM_PROMPT,
        userPrompt: wrapResumeText(input.resumeText),
        maxOutputTokens: env.AI_MAX_OUTPUT_TOKENS,
        timeoutMs: env.AI_REQUEST_TIMEOUT_MS,
      });

      const usage = {
        provider: MODEL_PROVIDER_NAME,
        model: response.model,
        inputUnits: response.inputUnits,
        outputUnits: response.outputUnits,
        latencyMs: response.latencyMs,
      };

      if (!response.ok) {
        return { ok: false, errorCode: response.errorCode, usage };
      }

      const parsed = parseSchema(resumeExtractionSchema, response.value);

      if (!parsed.ok) {
        return { ok: false, errorCode: 'invalid-output', usage };
      }

      return { ok: true, value: parsed.value, usage };
    },

    async translatePortfolio(
      input: PortfolioTranslationInput,
    ): Promise<AiOutcome<PortfolioDocument>> {
      const env = getServerEnv();
      const model = env.AI_PRIMARY_MODEL;
      const emptyUsage = {
        provider: MODEL_PROVIDER_NAME,
        model,
        inputUnits: null,
        outputUnits: null,
        latencyMs: 0,
      };
      if (env.AI_API_KEY === undefined) {
        return { ok: false, errorCode: 'not-configured', usage: emptyUsage };
      }

      const response = await createStructuredClient({
        apiKey: env.AI_API_KEY,
        baseUrl: env.AI_BASE_URL,
      })({
        model,
        schema: portfolioDocumentSchema,
        systemPrompt: PORTFOLIO_TRANSLATION_SYSTEM_PROMPT,
        userPrompt: `Target locale: ${input.targetLocale}\n\n${JSON.stringify(input.document)}`,
        maxOutputTokens: env.AI_MAX_OUTPUT_TOKENS,
        timeoutMs: env.AI_REQUEST_TIMEOUT_MS,
      });
      const usage = {
        provider: MODEL_PROVIDER_NAME,
        model: response.model,
        inputUnits: response.inputUnits,
        outputUnits: response.outputUnits,
        latencyMs: response.latencyMs,
      };
      if (!response.ok) return { ok: false, errorCode: response.errorCode, usage };
      const parsed = parseSchema(portfolioDocumentSchema, response.value);
      return parsed.ok
        ? { ok: true, value: parsed.value, usage }
        : { ok: false, errorCode: 'invalid-output', usage };
    },
  };
}
