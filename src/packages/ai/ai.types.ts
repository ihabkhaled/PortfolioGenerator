import type { ZodType } from '@/packages/zod';

export interface StructuredRequest {
  readonly model: string;
  readonly schema: ZodType;
  readonly systemPrompt: string;
  readonly userPrompt: string;
  readonly maxOutputTokens: number;
  readonly timeoutMs: number;
}

/**
 * A structured-output result, already reduced to what may be stored.
 *
 * Token counts, a model id and a duration — no prompt, no completion, no
 * reasoning. The wrapper is where that reduction happens, so no caller has the
 * option of persisting more.
 */
export type StructuredResponse =
  | {
      readonly ok: true;
      readonly value: unknown;
      readonly model: string;
      readonly inputUnits: number | null;
      readonly outputUnits: number | null;
      readonly latencyMs: number;
    }
  | {
      readonly ok: false;
      readonly errorCode: 'invalid-output' | 'provider-error';
      readonly model: string;
      readonly inputUnits: number | null;
      readonly outputUnits: number | null;
      readonly latencyMs: number;
    };
