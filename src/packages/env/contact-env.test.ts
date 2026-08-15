import { describe, expect, it } from 'vitest';

import { parseServerEnvironment } from './server';

const base = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  BETTER_AUTH_SECRET: 'x'.repeat(32),
  BETTER_AUTH_URL: 'http://localhost:3000',
  ADMIN_AUTH_SECRET: 'y'.repeat(32),
};

describe('contact email environment', () => {
  it('does not require SMTP credentials when delivery is disabled', () => {
    expect(
      parseServerEnvironment({ ...base, CONTACT_EMAIL_ENABLED: 'false' }).CONTACT_EMAIL_ENABLED,
    ).toBe(false);
  });

  it('requires complete SMTP settings when delivery is enabled', () => {
    expect(() => parseServerEnvironment({ ...base, CONTACT_EMAIL_ENABLED: 'true' })).toThrow(
      'CONTACT_EMAIL_ENABLED=true requires',
    );
  });

  it('accepts complete Brevo relay settings', () => {
    expect(
      parseServerEnvironment({
        ...base,
        CONTACT_EMAIL_ENABLED: 'true',
        CONTACT_EMAIL_PROVIDER: 'smtp',
        CONTACT_EMAIL_FROM: 'sender@example.com',
        CONTACT_EMAIL_TO: 'support@example.com',
        CONTACT_RATE_LIMIT_MAX: '3',
        CONTACT_RATE_LIMIT_WINDOW_MS: '3600000',
        CONTACT_SMTP_HOST: 'smtp-relay.brevo.com',
        CONTACT_SMTP_PORT: '587',
        CONTACT_SMTP_SECURE: 'false',
        CONTACT_SMTP_USER: 'relay-user',
        CONTACT_SMTP_PASS: 'relay-password',
      }).CONTACT_SMTP_HOST,
    ).toBe('smtp-relay.brevo.com');
  });

  it('preserves the configurable contact quota contract', () => {
    const parsed = parseServerEnvironment({
      ...base,
      CONTACT_RATE_LIMIT_MAX: '5',
      CONTACT_RATE_LIMIT_WINDOW_MS: '1800000',
    });

    expect(parsed.CONTACT_EMAIL_PROVIDER).toBe('smtp');
    expect(parsed.CONTACT_RATE_LIMIT_MAX).toBe(5);
    expect(parsed.CONTACT_RATE_LIMIT_WINDOW_MS).toBe(1_800_000);
  });

  it('accepts capture only in a test runtime at the fixed test-results path', () => {
    expect(
      parseServerEnvironment({
        ...base,
        EMAIL_CAPTURE_PATH: 'test-results/email-capture.jsonl',
      }).EMAIL_CAPTURE_PATH,
    ).toBe('test-results/email-capture.jsonl');
    expect(() =>
      parseServerEnvironment({
        ...base,
        NODE_ENV: 'development',
        EMAIL_CAPTURE_PATH: 'test-results/email-capture.jsonl',
      }),
    ).toThrow('EMAIL_CAPTURE_PATH requires test mode outside public production');
    expect(() =>
      parseServerEnvironment({ ...base, EMAIL_CAPTURE_PATH: 'elsewhere/messages.jsonl' }),
    ).toThrow('Invalid server environment');
  });

  it('rejects capture in a public production deployment even in a test runtime', () => {
    expect(() =>
      parseServerEnvironment({
        ...base,
        NEXT_PUBLIC_APP_ENV: 'production',
        DATABASE_SSL_MODE: 'verify-full',
        EMAIL_CAPTURE_PATH: 'test-results/email-capture.jsonl',
        CLAMAV_ENABLED: 'true',
        CRON_SECRET: 'x'.repeat(32),
        AUTH_REQUIRE_EMAIL_VERIFICATION: 'true',
        CONTACT_EMAIL_ENABLED: 'true',
        CONTACT_EMAIL_FROM: 'sender@example.com',
        CONTACT_EMAIL_TO: 'support@example.com',
        CONTACT_SMTP_HOST: 'smtp.example.com',
        CONTACT_SMTP_USER: 'smtp-user',
        CONTACT_SMTP_PASS: 'smtp-password',
      }),
    ).toThrow('EMAIL_CAPTURE_PATH requires test mode outside public production');
  });

  it('requires verification on a public production deployment', () => {
    expect(() =>
      parseServerEnvironment({
        ...base,
        NEXT_PUBLIC_APP_ENV: 'production',
        DATABASE_SSL_MODE: 'verify-full',
        CLAMAV_ENABLED: 'true',
        CRON_SECRET: 'x'.repeat(32),
        STORAGE_DRIVER: 's3',
        S3_ENDPOINT: 'https://s3.example.com',
        S3_BUCKET: 'portfolios',
        S3_ACCESS_KEY_ID: 'key',
        S3_SECRET_ACCESS_KEY: 'secret',
      }),
    ).toThrow('AUTH_REQUIRE_EMAIL_VERIFICATION=true is required in production');
  });

  it('requires a configured transport whenever verification is mandatory', () => {
    expect(() =>
      parseServerEnvironment({ ...base, AUTH_REQUIRE_EMAIL_VERIFICATION: 'true' }),
    ).toThrow('AUTH_REQUIRE_EMAIL_VERIFICATION=true requires CONTACT_EMAIL_ENABLED=true');
    expect(() =>
      parseServerEnvironment({
        ...base,
        AUTH_REQUIRE_EMAIL_VERIFICATION: 'true',
        CONTACT_EMAIL_ENABLED: 'true',
      }),
    ).toThrow('CONTACT_EMAIL_ENABLED=true requires');
    expect(
      parseServerEnvironment({
        ...base,
        AUTH_REQUIRE_EMAIL_VERIFICATION: 'true',
        CONTACT_EMAIL_ENABLED: 'true',
        CONTACT_EMAIL_PROVIDER: 'smtp',
        CONTACT_EMAIL_FROM: 'sender@example.com',
        CONTACT_EMAIL_TO: 'support@example.com',
        CONTACT_SMTP_HOST: 'smtp.example.com',
        CONTACT_SMTP_USER: 'smtp-user',
        CONTACT_SMTP_PASS: 'smtp-password',
      }).AUTH_REQUIRE_EMAIL_VERIFICATION,
    ).toBe(true);
  });
});

describe('virus scanner environment', () => {
  it('does not treat the Next production build mode as a public deployment', () => {
    expect(
      parseServerEnvironment({ ...base, NODE_ENV: 'production', CLAMAV_ENABLED: 'false' })
        .CLAMAV_ENABLED,
    ).toBe(false);
  });

  /*
   * Scanning off in production is a risk, not a boot failure.
   *
   * It used to throw. That made the application undeployable on any platform
   * without a private network to reach clamd on, and a site that will not start
   * is not safer than one that starts with scanning off. The guarantee that
   * still holds is the one below it: when scanning is on and the daemon cannot
   * answer, the upload is refused.
   */
  it('boots a production public deployment that has opted out of scanning', () => {
    expect(
      parseServerEnvironment({
        ...base,
        NEXT_PUBLIC_APP_ENV: 'production',
        DATABASE_SSL_MODE: 'verify-full',
        STORAGE_DRIVER: 's3',
        S3_ENDPOINT: 'https://s3.example.com',
        S3_BUCKET: 'portfolios',
        S3_ACCESS_KEY_ID: 'key',
        S3_SECRET_ACCESS_KEY: 'secret',
        CLAMAV_ENABLED: 'false',
        CRON_SECRET: 'c'.repeat(32),
        AUTH_REQUIRE_EMAIL_VERIFICATION: 'true',
        CONTACT_EMAIL_ENABLED: 'true',
        CONTACT_EMAIL_FROM: 'sender@example.com',
        CONTACT_EMAIL_TO: 'support@example.com',
        CONTACT_SMTP_HOST: 'smtp-relay.brevo.com',
        CONTACT_SMTP_USER: 'relay-user',
        CONTACT_SMTP_PASS: 'relay-password',
      }).CLAMAV_ENABLED,
    ).toBe(false);
  });

  it('retains an explicit scanner opt-out outside production', () => {
    expect(
      parseServerEnvironment({ ...base, NODE_ENV: 'test', CLAMAV_ENABLED: 'false' }).CLAMAV_ENABLED,
    ).toBe(false);
  });
});
