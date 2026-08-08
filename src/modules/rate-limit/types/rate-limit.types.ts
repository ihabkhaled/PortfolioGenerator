/**
 * The rate-limit contract.
 *
 * Deliberately a counter, not a token bucket. Every limit in this product is
 * "N per user per day" or "N per IP per hour" — coarse, durable, and readable
 * in a database row when someone asks why they were blocked. A bucket would be
 * more elegant and less answerable.
 */
export interface RateLimiter {
  /**
   * Increment the bucket and report whether the caller may proceed. The
   * increment happens whether or not the call is allowed, so a client hammering
   * a blocked endpoint does not get a free retry every window.
   */
  consume: (input: RateLimitRequest) => Promise<RateLimitResult>;
  /** Read the current count without incrementing, for showing quota remaining. */
  peek: (input: RateLimitRequest) => Promise<RateLimitResult>;
}

export interface RateLimitRequest {
  /** Stable identity for the limit, e.g. `import:user:<id>`. */
  readonly bucket: string;
  readonly limit: number;
  readonly windowSeconds: number;
  /** Injected so tests and the caller agree on "now" without stubbing globals. */
  readonly now: Date;
}

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly used: number;
  readonly limit: number;
  readonly resetsAt: Date;
}

export type QuotaKind =
  'resume-import' | 'ai-operation' | 'upload-ip' | 'platform-ai-hourly' | 'platform-ai-daily';
