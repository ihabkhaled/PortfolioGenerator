import type { PortfolioDocument } from '@/modules/portfolio-document';
import type { z } from '@/packages/zod';

import type { resumeExtractionSchema } from '../schemas/resume-extraction.schema';

export type ResumeExtractionResult = z.infer<typeof resumeExtractionSchema>;

export interface ResumeExtractionInput {
  /** Already normalized and capped; the provider does not reshape it. */
  readonly resumeText: string;
  /** Set when a previous attempt failed validation, to select the stronger model. */
  readonly useFallbackModel: boolean;
}

export interface PortfolioTranslationInput {
  readonly document: PortfolioDocument;
  readonly targetLocale: string;
}

/**
 * Provider telemetry. Everything here is safe to store: counts, durations and
 * model identifiers. Prompt text, completion text and reasoning are
 * deliberately absent — `ai_runs` must never become a copy of people's CVs.
 */
export interface AiUsage {
  readonly provider: string;
  readonly model: string;
  readonly inputUnits: number | null;
  readonly outputUnits: number | null;
  readonly latencyMs: number;
}

export type AiOutcome<TValue> =
  | { readonly ok: true; readonly value: TValue; readonly usage: AiUsage }
  | { readonly ok: false; readonly errorCode: AiErrorCode; readonly usage: AiUsage };

export type AiErrorCode = 'invalid-output' | 'provider-error' | 'timeout' | 'not-configured';

/**
 * The capability the application depends on.
 *
 * Named for what it does, not for who provides it: no method mentions a vendor,
 * a model family or an endpoint. Swapping providers is implementing this
 * interface, and business logic never learns that anything changed.
 */
export interface PortfolioAiProvider {
  readonly name: string;
  extractResume: (input: ResumeExtractionInput) => Promise<AiOutcome<ResumeExtractionResult>>;
  translatePortfolio: (input: PortfolioTranslationInput) => Promise<AiOutcome<PortfolioDocument>>;
}
