export const SECONDS_PER_HOUR = 3600;
export const SECONDS_PER_DAY = 86_400;

/**
 * How long a spent counter row is kept before it can be swept.
 *
 * One extra window, so a request arriving at the very edge of a window still
 * finds its row rather than silently getting a fresh allowance.
 */
export const COUNTER_RETENTION_WINDOWS = 2;

export const QUOTA_BUCKETS = {
  resumeImport: 'import:user',
  aiOperation: 'ai:user',
  uploadIp: 'upload:ip',
  platformAiHourly: 'ai:platform:hourly',
  platformAiDaily: 'ai:platform:daily',
} as const;

/** The whole platform shares one subject for the budget breaker. */
export const PLATFORM_SUBJECT = 'all';
