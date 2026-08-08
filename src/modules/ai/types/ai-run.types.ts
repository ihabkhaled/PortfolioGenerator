export type AiRunStatus = 'SUCCEEDED' | 'FAILED_VALIDATION' | 'FAILED_PROVIDER' | 'FAILED_TIMEOUT';

export interface AiRunInput {
  readonly ownerId: string;
  readonly portfolioId: string | null;
  readonly resumeUploadId: string | null;
  readonly operation: string;
  readonly provider: string;
  readonly model: string;
  readonly status: AiRunStatus;
  readonly inputUnits: number | null;
  readonly outputUnits: number | null;
  readonly latencyMs: number | null;
  readonly retryCount: number;
  readonly fallbackUsed: boolean;
  readonly errorCode: string | null;
}
