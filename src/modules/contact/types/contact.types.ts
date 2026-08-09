import type { EmailSender } from '@/packages/email/server';

export interface ContactSubmission {
  readonly name: string;
  readonly email: string;
  readonly subject: string;
  readonly message: string;
  readonly website: string;
}

export interface ContactRequestContext {
  readonly address: string;
  readonly now: Date;
}

export interface ContactResult {
  readonly status: 'accepted' | 'invalid' | 'rate-limited' | 'unavailable';
}

export type ContactSubmissionStatus =
  'idle' | 'pending' | 'accepted' | 'invalid' | 'rate-limited' | 'unavailable';

export interface ContactDependencies {
  readonly deliver: EmailSender['sendContact'];
  readonly consumeRateLimit: (input: {
    bucket: string;
    limit: number;
    windowSeconds: number;
    now: Date;
  }) => Promise<{ allowed: boolean; used: number; limit: number; resetsAt: Date }>;
  readonly log: (event: string, fields: Readonly<Record<string, string>>) => void;
  readonly rateLimitMax?: number;
  readonly rateLimitWindowMs?: number;
}
