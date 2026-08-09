import type { PortfolioDocument } from '@/modules/portfolio-document';

import { DETERMINISTIC_PROVIDER_NAME } from '../constants/deterministic.constants';
import { parseDeterministicResume } from '../helpers/deterministic-extraction.helper';
import type {
  AiOutcome,
  PortfolioAiProvider,
  ResumeExtractionInput,
  ResumeExtractionResult,
  PortfolioTranslationInput,
} from '../types/ai-provider.types';

/**
 * The offline extraction provider.
 *
 * This is not a mock that returns a canned object. It is a real, if simple,
 * rule-based parser over the same normalized text a model would receive, which
 * makes it useful for three things a stub is not:
 *
 *   - CI runs the entire golden path end to end without a network call or a
 *     bill, and the assertions are about the pipeline, not about a fixture;
 *   - a developer with no API key gets a working product;
 *   - the deployment can fall back to it, so "the AI provider is down" degrades
 *     to a rougher import rather than a broken feature.
 *
 * It is deliberately conservative: it emits only what it can see in the text,
 * and reports what it could not parse as warnings — the same contract the model
 * is held to.
 */
export function createDeterministicAiProvider(): PortfolioAiProvider {
  return {
    name: DETERMINISTIC_PROVIDER_NAME,

    extractResume(input: ResumeExtractionInput): Promise<AiOutcome<ResumeExtractionResult>> {
      const startedAt = performance.now();
      const value = parseDeterministicResume(input.resumeText);

      return Promise.resolve({
        ok: true,
        value,
        usage: {
          provider: DETERMINISTIC_PROVIDER_NAME,
          model: DETERMINISTIC_PROVIDER_NAME,
          // No units: nothing was billed, and recording a zero would make the
          // cost-per-extraction dashboard quietly wrong.
          inputUnits: null,
          outputUnits: null,
          latencyMs: Math.round(performance.now() - startedAt),
        },
      });
    },

    translatePortfolio(_input: PortfolioTranslationInput): Promise<AiOutcome<PortfolioDocument>> {
      return Promise.resolve({
        ok: false,
        errorCode: 'not-configured',
        usage: {
          provider: DETERMINISTIC_PROVIDER_NAME,
          model: DETERMINISTIC_PROVIDER_NAME,
          inputUnits: null,
          outputUnits: null,
          latencyMs: 0,
        },
      });
    },
  };
}
