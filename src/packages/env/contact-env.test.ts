import { describe, expect, it } from 'vitest';

import { parseServerEnvironment } from './server';

const base = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  BETTER_AUTH_SECRET: 'x'.repeat(32),
  BETTER_AUTH_URL: 'http://localhost:3000',
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
});
