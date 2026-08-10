import 'server-only';

import { getRateLimiter } from '@/modules/rate-limit/server';
import { sha256Hex } from '@/packages/cryptography';
import { getServerEnv } from '@/packages/env/server';
import { logger } from '@/packages/logger';
import { parseSchema } from '@/packages/zod';

import { PAYMENTS_WEBHOOK_RATE_LIMIT } from '../constants/payments.constants';
import { resolvePaypalClientEnv } from '../policies/paypal-config.policy';
import { mapWebhookEventToUpdate } from '../policies/webhook-event.policy';
import { verifyPaypalWebhookSignature } from '../providers/paypal-webhook-verifier.provider';
import {
  applySubscriptionUpdate,
  recordWebhookEventIfNew,
} from '../repositories/billing.repository';
import { paypalWebhookEnvelopeSchema } from '../schemas/paypal-webhook.schema';
import type { PaypalWebhookHeaders, WebhookProcessResult } from '../types/payments.types';

/**
 * The one path an inbound PayPal webhook goes through.
 *
 * The order is the guarantee, not an implementation detail: rate-limit,
 * parse, verify, de-duplicate, map, apply. The rate limit is per-IP through
 * the same Postgres-backed limiter every other public route in this app uses
 * (see ADR-0003) rather than a new mechanism — generous, because PayPal's own
 * retries and a burst of genuine events from PayPal's infrastructure must not
 * be mistaken for abuse. Verification happens before the event id is trusted
 * for dedupe — an unverified id is not a fact about anything yet — and dedupe
 * happens before the update is applied, so a retried delivery of an event
 * already processed is a no-op rather than a repeated state change. Never
 * logs the raw body or the resource payload, only the event type and the
 * outcome.
 */
export async function handlePaypalWebhook(
  rawBody: string,
  headers: PaypalWebhookHeaders,
  address: string,
): Promise<WebhookProcessResult> {
  const paypalEnv = resolvePaypalClientEnv(getServerEnv());

  if (paypalEnv === null) {
    return { status: 'not-configured' };
  }

  const quota = await getRateLimiter().consume({
    bucket: `payments:webhook:ip:${sha256Hex(address)}`,
    limit: PAYMENTS_WEBHOOK_RATE_LIMIT.max,
    windowSeconds: PAYMENTS_WEBHOOK_RATE_LIMIT.windowSeconds,
    now: new Date(),
  });

  if (!quota.allowed) {
    return { status: 'rate-limited' };
  }

  let parsedBody: unknown;

  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    return { status: 'invalid' };
  }

  const envelope = parseSchema(paypalWebhookEnvelopeSchema, parsedBody);

  if (!envelope.ok) {
    return { status: 'invalid' };
  }

  const verified = await verifyPaypalWebhookSignature(paypalEnv, headers, parsedBody);

  if (!verified) {
    logger.warn('payments.webhook_signature_invalid', { eventType: envelope.value.event_type });

    return { status: 'invalid-signature' };
  }

  const isNew = await recordWebhookEventIfNew(
    envelope.value.id,
    envelope.value.event_type,
    new Date(),
  );

  if (!isNew) {
    return { status: 'duplicate' };
  }

  const update = mapWebhookEventToUpdate(envelope.value);

  if (update === null) {
    return { status: 'ignored' };
  }

  const applied = await applySubscriptionUpdate(update, new Date());

  logger.info('payments.webhook_processed', {
    eventType: envelope.value.event_type,
    status: update.status,
    applied,
  });

  return { status: 'processed' };
}
