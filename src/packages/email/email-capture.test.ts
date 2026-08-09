import { readFile, rm } from 'node:fs/promises';

import { afterEach, describe, expect, it } from 'vitest';

import { createEmailCaptureSender } from './email-capture';

afterEach(async () => {
  await rm('test-results/email-capture.jsonl', { force: true });
});

describe('test email capture', () => {
  it('captures verification delivery without writing the token to logs or public state', async () => {
    await rm('test-results/email-capture.jsonl', { force: true });
    const sender = createEmailCaptureSender();

    await sender.sendEmailVerification({
      email: 'owner@example.com',
      verificationUrl: 'http://localhost:3100/api/auth/verify-email?token=secret-token',
    });

    expect(JSON.parse(await readFile('test-results/email-capture.jsonl', 'utf8'))).toEqual({
      kind: 'email-verification',
      email: 'owner@example.com',
      url: 'http://localhost:3100/api/auth/verify-email?token=secret-token',
    });
  });
});
