import { appendFile, mkdir } from 'node:fs/promises';

import type { EmailSender } from './email.types';

export function createEmailCaptureSender(): EmailSender {
  return {
    checkReadiness: () => Promise.resolve(),
    sendContact: () => Promise.resolve(),
    sendPasswordReset: () => Promise.resolve(),
    sendEmailVerification: async (message) => {
      await mkdir('test-results', { recursive: true });
      await appendFile(
        'test-results/email-capture.jsonl',
        `${JSON.stringify({
          kind: 'email-verification',
          email: message.email,
          url: message.verificationUrl,
        })}\n`,
        { encoding: 'utf8', mode: 0o600 },
      );
    },
  };
}
