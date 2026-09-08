import type { ZodType } from '@/packages/zod';

export interface StructuredRequest {
  readonly model: string;
  readonly schema: ZodType;
  readonly systemPrompt: string;
  readonly userPrompt: string;
  readonly maxOutputTokens: number;
  readonly timeoutMs: number;
}

export type StructuredErrorCode = 'invalid-output' | 'provider-error' | 'quota-exceeded';

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
      readonly errorCode: StructuredErrorCode;
      /**
       * Why the call failed, in provider terms: an error class, the HTTP
       * status, and the endpoint that answered. Never the prompt, the
       * completion or the response body — the reduction above still holds.
       *
       * `errorCode` alone cannot tell a rejected key from a base URL pointing
       * at the wrong protocol, and both present as `provider-error`. Without
       * this, a misconfigured deployment is indistinguishable from an outage.
       */
      readonly failureReason: string | null;
      readonly model: string;
      readonly inputUnits: number | null;
      readonly outputUnits: number | null;
      readonly latencyMs: number;
    };
