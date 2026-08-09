import 'server-only';

import { getRateLimiter } from '@/modules/rate-limit/server';
import { sha256Hex } from '@/packages/cryptography';
import { createConfiguredEmailSender } from '@/packages/email/server';
import { getServerEnv } from '@/packages/env/server';
import { logger } from '@/packages/logger';

import { CONTACT_LIMIT, CONTACT_WINDOW_SECONDS } from '../constants/contact.constants';
import { parseContactSubmission } from '../schemas/contact.schema';
import type {
  ContactDependencies,
  ContactRequestContext,
  ContactResult,
} from '../types/contact.types';

function defaultDependencies(): ContactDependencies {
  const env = getServerEnv();
  return {
    deliver: createConfiguredEmailSender().sendContact,
    consumeRateLimit: (input) => getRateLimiter().consume(input),
    log: (event, fields) => {
      logger.error(event, fields);
    },
    rateLimitMax: env.CONTACT_RATE_LIMIT_MAX,
    rateLimitWindowMs: env.CONTACT_RATE_LIMIT_WINDOW_MS,
  };
}

export async function sendContactMessage(
  input: unknown,
  requestContext: ContactRequestContext,
  dependencies: ContactDependencies = defaultDependencies(),
): Promise<ContactResult> {
  const parsed = parseContactSubmission(input);
  if (!parsed.ok) return { status: 'invalid' };
  if (parsed.value.website) return { status: 'accepted' };

  const quota = await dependencies.consumeRateLimit({
    // Persist a fixed-size pseudonymous key, not a forwarded address supplied
    // by an unauthenticated request.
    bucket: `contact:ip:${sha256Hex(requestContext.address)}`,
    limit: dependencies.rateLimitMax ?? CONTACT_LIMIT,
    windowSeconds: Math.ceil(
      (dependencies.rateLimitWindowMs ?? CONTACT_WINDOW_SECONDS * 1000) / 1000,
    ),
    now: requestContext.now,
  });
  if (!quota.allowed) return { status: 'rate-limited' };

  try {
    await dependencies.deliver(parsed.value);
    return { status: 'accepted' };
  } catch {
    dependencies.log('contact.delivery_failed', { provider: 'smtp' });
    return { status: 'unavailable' };
  }
}
