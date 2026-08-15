import { afterEach, describe, expect, it } from 'vitest';

import { serverEnvSchema } from '@/packages/env/env.schema';
import { getServerEnv, resetServerEnvCache } from '@/packages/env/server';
import { parseSchema } from '@/packages/zod';
import { getUploadLimits } from '@/shared/config/upload-limits';

/**
 * Configuration is validated once, at the boundary, and the app refuses to boot
 * on an invalid value.
 *
 * The conditional requirements are the part worth testing: a driver selected
 * without its credentials fails at the first upload or the first extraction
 * otherwise — long after deploy, and only for the unlucky user who triggered it.
 */

const BASE_ENV: Record<string, string> = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5433/portfolio_generate_test',
  BETTER_AUTH_SECRET: 'a'.repeat(48),
  BETTER_AUTH_URL: 'http://localhost:3000',
  ADMIN_AUTH_SECRET: 'b'.repeat(48),
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NEXT_PUBLIC_APP_ENV: 'local',
  STORAGE_DRIVER: 'local',
  STORAGE_LOCAL_ROOT: '.storage',
  AI_PROVIDER: 'deterministic',
};

const ORIGINAL_ENV = { ...process.env };

function applyEnv(overrides: Record<string, string | undefined>): void {
  process.env = { ...BASE_ENV, ...overrides } as NodeJS.ProcessEnv;
  resetServerEnvCache();
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  resetServerEnvCache();
});

describe('getServerEnv', () => {
  it('accepts a complete local configuration', () => {
    applyEnv({});

    expect(getServerEnv().STORAGE_DRIVER).toBe('local');
  });

  it('memoizes so every caller sees the same validated object', () => {
    applyEnv({});

    expect(getServerEnv()).toBe(getServerEnv());
  });

  it('refuses to boot without a database URL', () => {
    applyEnv({ DATABASE_URL: undefined });

    expect(() => getServerEnv()).toThrow(/Invalid server environment/);
  });

  it('refuses a short auth secret', () => {
    applyEnv({ BETTER_AUTH_SECRET: 'too-short' });

    expect(() => getServerEnv()).toThrow(/Invalid server environment/);
  });

  it('refuses a short admin auth secret', () => {
    applyEnv({ ADMIN_AUTH_SECRET: 'too-short' });

    expect(() => getServerEnv()).toThrow(/Invalid server environment/);
  });

  it('refuses a missing admin auth secret', () => {
    applyEnv({ ADMIN_AUTH_SECRET: undefined });

    expect(() => getServerEnv()).toThrow(/Invalid server environment/);
  });

  it('refuses an admin auth secret equal to the user-facing auth secret in production', () => {
    applyEnv({
      NEXT_PUBLIC_APP_ENV: 'production',
      DATABASE_SSL_MODE: 'verify-full',
      ADMIN_AUTH_SECRET: 'a'.repeat(48),
      CRON_SECRET: 'c'.repeat(32),
      AUTH_REQUIRE_EMAIL_VERIFICATION: 'true',
      CONTACT_EMAIL_ENABLED: 'true',
      CONTACT_EMAIL_FROM: 'sender@example.com',
      CONTACT_EMAIL_TO: 'support@example.com',
      CONTACT_SMTP_HOST: 'smtp.example.com',
      CONTACT_SMTP_USER: 'smtp-user',
      CONTACT_SMTP_PASS: 'smtp-password',
      STORAGE_DRIVER: 's3',
      S3_ENDPOINT: 'https://s3.example.com',
      S3_BUCKET: 'portfolios',
      S3_ACCESS_KEY_ID: 'key',
      S3_SECRET_ACCESS_KEY: 'secret',
    });

    expect(() => getServerEnv()).toThrow(/ADMIN_AUTH_SECRET must not equal BETTER_AUTH_SECRET/);
  });

  // Selecting s3 and forgetting the bucket must fail at boot, not at the first
  // upload someone's CV happens to land on.
  it('names the missing S3 settings when the s3 driver is selected', () => {
    applyEnv({ STORAGE_DRIVER: 's3' });

    expect(() => getServerEnv()).toThrow(/STORAGE_DRIVER=s3 requires/);
  });

  it('accepts the s3 driver when it is fully configured', () => {
    applyEnv({
      STORAGE_DRIVER: 's3',
      S3_ENDPOINT: 'https://s3.example.com',
      S3_REGION: 'auto',
      S3_BUCKET: 'portfolios',
      S3_ACCESS_KEY_ID: 'key',
      S3_SECRET_ACCESS_KEY: 'secret',
    });

    expect(getServerEnv().S3_BUCKET).toBe('portfolios');
  });

  it('refuses local storage in public production', () => {
    applyEnv({
      NEXT_PUBLIC_APP_ENV: 'production',
      DATABASE_SSL_MODE: 'verify-full',
      CRON_SECRET: 'c'.repeat(32),
      AUTH_REQUIRE_EMAIL_VERIFICATION: 'true',
      CONTACT_EMAIL_ENABLED: 'true',
      CONTACT_EMAIL_FROM: 'sender@example.com',
      CONTACT_EMAIL_TO: 'support@example.com',
      CONTACT_SMTP_HOST: 'smtp.example.com',
      CONTACT_SMTP_USER: 'smtp-user',
      CONTACT_SMTP_PASS: 'smtp-password',
    });

    expect(() => getServerEnv()).toThrow(/STORAGE_DRIVER=s3 is required in public production/);
  });

  it('names the missing AI settings when a remote provider is selected', () => {
    applyEnv({ AI_PROVIDER: 'openai-compatible' });

    expect(() => getServerEnv()).toThrow(/AI_PROVIDER=openai-compatible requires/);
  });

  it('accepts a remote AI provider when it is fully configured', () => {
    applyEnv({
      AI_PROVIDER: 'openai-compatible',
      AI_BASE_URL: 'https://api.example.com/v1',
      AI_API_KEY: 'test-key',
    });

    expect(getServerEnv().AI_PROVIDER).toBe('openai-compatible');
  });
});

describe('environment defaults and coercions', () => {
  it('falls back to the documented defaults when optional values are absent', () => {
    applyEnv({});

    const env = getServerEnv();

    expect(env.UPLOAD_MAX_BYTES).toBe(8_388_608);
    expect(env.UPLOAD_MAX_PAGES).toBe(15);
    expect(env.AI_PRIMARY_MODEL).toBe('gpt-5-mini');
    expect(env.RESUME_RETENTION_DAYS).toBe(90);
  });

  // Everything arrives from the process as a string; the limits are numbers.
  it('coerces numeric limits from their string form', () => {
    applyEnv({ UPLOAD_MAX_PAGES: '25', QUOTA_IMPORTS_PER_USER_PER_DAY: '3' });

    const env = getServerEnv();

    expect(env.UPLOAD_MAX_PAGES).toBe(25);
    expect(env.QUOTA_IMPORTS_PER_USER_PER_DAY).toBe(3);
  });

  it.each(['true', '1'])('reads %s as an enabled flag', (value) => {
    applyEnv({ CONTACT_SMTP_SECURE: value });

    expect(getServerEnv().CONTACT_SMTP_SECURE).toBe(true);
  });

  it.each(['false', '0'])('reads %s as a disabled flag', (value) => {
    applyEnv({ CONTACT_SMTP_SECURE: value });

    expect(getServerEnv().CONTACT_SMTP_SECURE).toBe(false);
  });

  // A limit of zero would disable the feature by accident rather than by
  // decision, and a negative one is meaningless.
  it.each(['0', '-1', 'lots'])('refuses %s as a limit', (value) => {
    applyEnv({ UPLOAD_MAX_PAGES: value });

    expect(() => getServerEnv()).toThrow(/Invalid server environment/);
  });

  it('treats a blank optional value as absent rather than as an empty string', () => {
    applyEnv({ S3_BUCKET: ' '.repeat(3) });

    expect(getServerEnv().S3_BUCKET).toBeUndefined();
  });
});

describe('getUploadLimits', () => {
  // A limit a user discovers by hitting it is a limit that wasted their time,
  // so the UI states it up front — in megabytes, not bytes.
  it('reports the byte limit in the unit the upload screen shows', () => {
    applyEnv({ UPLOAD_MAX_BYTES: '8388608', UPLOAD_MAX_PAGES: '15' });

    expect(getUploadLimits()).toEqual({ maxMegabytes: 8, maxPages: 15 });
  });

  it('rounds down rather than promising a megabyte that would be rejected', () => {
    applyEnv({ UPLOAD_MAX_BYTES: '5242879' });

    expect(getUploadLimits().maxMegabytes).toBe(4);
  });
});

describe('serverEnvSchema', () => {
  // The schema is also parsed in tests and scripts, where a flag arrives as a
  // real boolean rather than as the string a process hands over.
  it('accepts a boolean flag as well as its string form', () => {
    const result = parseSchema(serverEnvSchema, { ...BASE_ENV, CONTACT_EMAIL_ENABLED: true });

    expect(result.ok && result.value.CONTACT_EMAIL_ENABLED).toBe(true);
  });

  it('rejects a flag value that is neither', () => {
    expect(parseSchema(serverEnvSchema, { ...BASE_ENV, CONTACT_EMAIL_ENABLED: 'maybe' }).ok).toBe(
      false,
    );
  });
});
