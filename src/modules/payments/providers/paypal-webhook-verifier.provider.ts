import 'server-only';

import type {
  PaypalClientEnv,
  PaypalVerifySignatureResponse,
  PaypalWebhookHeaders,
} from '../types/payments.types';

import { callPaypalApi } from './paypal-client.provider';

/**
 * The mandatory check before any webhook payload is trusted.
 *
 * PayPal's model differs from an HMAC-over-raw-bytes scheme: rather than this
 * app recomputing a signature locally, it hands the transmission headers and
 * the parsed event back to PayPal's own verify-webhook-signature endpoint and
 * PayPal confirms whether they match what it sent. `webhookId` here is the
 * opaque id from `PAYPAL_WEBHOOK_ID` — see the comment on that variable in
 * `env.schema.ts` — never the route path.
 *
 * A malformed header, a network failure, or PayPal answering anything other
 * than `SUCCESS` all resolve to `false`. There is no partial trust here: this
 * is the one function standing between an unauthenticated POST body and a
 * change to someone's billing state.
 */
export async function verifyPaypalWebhookSignature(
  env: PaypalClientEnv,
  headers: PaypalWebhookHeaders,
  webhookEvent: unknown,
): Promise<boolean> {
  if (
    headers.transmissionId === null ||
    headers.transmissionTime === null ||
    headers.certUrl === null ||
    headers.authAlgo === null ||
    headers.transmissionSig === null
  ) {
    return false;
  }

  try {
    const result = await callPaypalApi<PaypalVerifySignatureResponse>(
      env,
      '/v1/notifications/verify-webhook-signature',
      {
        method: 'POST',
        body: {
          transmission_id: headers.transmissionId,
          transmission_time: headers.transmissionTime,
          cert_url: headers.certUrl,
          auth_algo: headers.authAlgo,
          transmission_sig: headers.transmissionSig,
          webhook_id: env.webhookId,
          webhook_event: webhookEvent,
        },
      },
    );

    return result.verification_status === 'SUCCESS';
  } catch {
    // A verification call that failed to complete is not a verified event.
    // The caller logs this at the response layer, without the payload.
    return false;
  }
}
