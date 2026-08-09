import 'server-only';

import { getServerEnv } from '@/packages/env/server';

import type { EmailSender } from './email.types';
import { createSmtpEmailSender } from './smtp-client';

const disabledSender: EmailSender = {
  sendContact: () => Promise.resolve(),
  sendPasswordReset: () => Promise.resolve(),
  sendEmailVerification: () => Promise.resolve(),
};

export function createConfiguredEmailSender(): EmailSender {
  const env = getServerEnv();
  if (!env.CONTACT_EMAIL_ENABLED) return disabledSender;

  const {
    CONTACT_SMTP_HOST,
    CONTACT_SMTP_USER,
    CONTACT_SMTP_PASS,
    CONTACT_EMAIL_FROM,
    CONTACT_EMAIL_TO,
  } = env;
  if (
    !CONTACT_SMTP_HOST ||
    !CONTACT_SMTP_USER ||
    !CONTACT_SMTP_PASS ||
    !CONTACT_EMAIL_FROM ||
    !CONTACT_EMAIL_TO
  ) {
    throw new Error('Contact email configuration was not validated');
  }

  return createSmtpEmailSender({
    host: CONTACT_SMTP_HOST,
    port: env.CONTACT_SMTP_PORT,
    secure: env.CONTACT_SMTP_SECURE,
    user: CONTACT_SMTP_USER,
    password: CONTACT_SMTP_PASS,
    from: CONTACT_EMAIL_FROM,
    to: CONTACT_EMAIL_TO,
    resetBaseUrl: env.BETTER_AUTH_URL,
    allowInsecureResetUrl: env.NODE_ENV !== 'production',
  });
}

export type {
  ContactEmail,
  EmailSender,
  EmailVerificationEmail,
  PasswordResetEmail,
} from './email.types';
