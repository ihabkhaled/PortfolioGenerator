import type { PaypalClientEnv, PaypalRawEnv } from '../types/payments.types';

/**
 * Narrow the raw (possibly unconfigured) environment to a guaranteed-present
 * `PaypalClientEnv`, or `null` when billing is off.
 *
 * `env.schema.ts` already enforces "all four PayPal values or none" at boot,
 * so in practice this is never partially undefined — this function is the
 * type-safe way every caller gets to stop re-checking that after boot.
 */
export function resolvePaypalClientEnv(env: PaypalRawEnv): PaypalClientEnv | null {
  if (
    env.PAYPAL_CLIENT_ID === undefined ||
    env.PAYPAL_CLIENT_SECRET === undefined ||
    env.PAYPAL_WEBHOOK_ID === undefined
  ) {
    return null;
  }

  return {
    paypalEnv: env.PAYPAL_ENV,
    clientId: env.PAYPAL_CLIENT_ID,
    clientSecret: env.PAYPAL_CLIENT_SECRET,
    webhookId: env.PAYPAL_WEBHOOK_ID,
  };
}
