import { z } from '@/packages/zod';

/**
 * Every environment value is validated once, here, at boot. A misconfigured
 * deployment should fail loudly on startup rather than silently ship localhost
 * URLs into sitemaps or run with a missing auth secret.
 */

const nonEmpty = z.string().trim().min(1);
const optionalString = z
  .string()
  .trim()
  .transform((value) => (value === '' ? undefined : value))
  .optional();

const booleanFlag = z
  .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
  .transform((value) => (typeof value === 'boolean' ? value : ['true', '1'].includes(value)));

const positiveInt = z.coerce.number().int().positive();

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_APP_ENV: z.enum(['local', 'staging', 'production']).default('local'),
});

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  DATABASE_URL: nonEmpty,

  // 32 characters is the practical floor for a session-signing secret; a short
  // one is a silent downgrade of every session in the system.
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),

  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  STORAGE_LOCAL_ROOT: z.string().trim().default('.storage'),
  S3_ENDPOINT: optionalString,
  S3_REGION: z.string().trim().default('auto'),
  S3_BUCKET: optionalString,
  S3_ACCESS_KEY_ID: optionalString,
  S3_SECRET_ACCESS_KEY: optionalString,

  AI_PROVIDER: z.enum(['deterministic', 'openai-compatible']).default('deterministic'),
  AI_BASE_URL: optionalString,
  AI_API_KEY: optionalString,
  AI_PRIMARY_MODEL: z.string().trim().default('gpt-5-mini'),
  AI_FALLBACK_MODEL: z.string().trim().default('gpt-5'),
  AI_TRANSLATION_MODEL: optionalString,
  AI_MAX_OUTPUT_TOKENS: positiveInt.default(8000),
  AI_REQUEST_TIMEOUT_MS: positiveInt.default(60_000),

  UPLOAD_MAX_BYTES: positiveInt.default(8_388_608),
  UPLOAD_MAX_PAGES: positiveInt.default(15),
  EXTRACTION_MAX_INPUT_CHARS: positiveInt.default(60_000),
  OCR_ENABLED: booleanFlag.default(false),

  QUOTA_IMPORTS_PER_USER_PER_DAY: positiveInt.default(5),
  QUOTA_AI_OPERATIONS_PER_USER_PER_DAY: positiveInt.default(20),
  QUOTA_UPLOADS_PER_IP_PER_HOUR: positiveInt.default(20),
  BUDGET_MAX_AI_OPERATIONS_PER_HOUR: positiveInt.default(200),
  BUDGET_MAX_AI_OPERATIONS_PER_DAY: positiveInt.default(2000),

  RESUME_RETENTION_DAYS: positiveInt.default(90),

  /*
   * Virus scanning.
   *
   * Off by default so a fresh checkout runs without a daemon, and pinned on in
   * production by configuration rather than by code. When it is on and clamd is
   * unreachable, uploads are refused — see `inspectAndScan` for why that is the
   * safe direction.
   */
  CLAMAV_ENABLED: booleanFlag.default(false),
  CLAMAV_HOST: z.string().trim().default('127.0.0.1'),
  CLAMAV_PORT: positiveInt.default(3310),
  CLAMAV_TIMEOUT_MS: positiveInt.default(20_000),

  UPLOAD_IMAGE_MAX_BYTES: positiveInt.default(6_291_456),

  CONTACT_EMAIL_ENABLED: booleanFlag.default(false),
  CONTACT_EMAIL_PROVIDER: z.enum(['smtp']).default('smtp'),
  CONTACT_EMAIL_FROM: optionalString,
  CONTACT_EMAIL_TO: optionalString,
  CONTACT_RATE_LIMIT_MAX: positiveInt.default(3),
  CONTACT_RATE_LIMIT_WINDOW_MS: positiveInt.default(3_600_000),
  CONTACT_SMTP_HOST: optionalString,
  CONTACT_SMTP_PORT: positiveInt.default(587),
  CONTACT_SMTP_SECURE: booleanFlag.default(false),
  CONTACT_SMTP_USER: optionalString,
  CONTACT_SMTP_PASS: optionalString,
});

export const s3ConfiguredSchema = z.object({
  S3_ENDPOINT: nonEmpty,
  S3_BUCKET: nonEmpty,
  S3_ACCESS_KEY_ID: nonEmpty,
  S3_SECRET_ACCESS_KEY: nonEmpty,
});

export const aiRemoteConfiguredSchema = z.object({
  AI_API_KEY: nonEmpty,
});

export const contactEmailConfiguredSchema = z.object({
  CONTACT_EMAIL_PROVIDER: z.literal('smtp'),
  CONTACT_EMAIL_FROM: z.email(),
  CONTACT_EMAIL_TO: z.email(),
  CONTACT_SMTP_HOST: nonEmpty,
  CONTACT_SMTP_USER: nonEmpty,
  CONTACT_SMTP_PASS: nonEmpty,
});
