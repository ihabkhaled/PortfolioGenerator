import {
  BILLING_NO_STORE_HEADERS,
  PAYMENTS_WEBHOOK_HTTP_STATUS,
  PAYMENTS_WEBHOOK_MAX_BODY_BYTES,
} from '@/modules/payments';
import { handlePaypalWebhook } from '@/modules/payments/server';
import { getClientAddress } from '@/packages/headers';

export const dynamic = 'force-dynamic';

/**
 * PayPal's inbound webhook endpoint.
 *
 * This route is what gets registered as a webhook endpoint in the PayPal
 * developer dashboard; PayPal responds to that registration with an opaque
 * id, which is `PAYPAL_WEBHOOK_ID` — the route itself is not that id, and is
 * never treated as a secret. Every byte of the body is read once, as text,
 * and handed to `handlePaypalWebhook` unparsed-by-us so verification sees
 * exactly what PayPal sent.
 */
export async function POST(request: Request): Promise<Response> {
  const declaredLength = Number(request.headers.get('content-length') ?? 0);

  if (!Number.isFinite(declaredLength) || declaredLength > PAYMENTS_WEBHOOK_MAX_BODY_BYTES) {
    return Response.json(
      { status: 'invalid' },
      { status: PAYMENTS_WEBHOOK_HTTP_STATUS.invalid, headers: BILLING_NO_STORE_HEADERS },
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > PAYMENTS_WEBHOOK_MAX_BODY_BYTES) {
    return Response.json(
      { status: 'invalid' },
      { status: PAYMENTS_WEBHOOK_HTTP_STATUS.invalid, headers: BILLING_NO_STORE_HEADERS },
    );
  }

  const result = await handlePaypalWebhook(
    rawBody,
    {
      transmissionId: request.headers.get('paypal-transmission-id'),
      transmissionTime: request.headers.get('paypal-transmission-time'),
      certUrl: request.headers.get('paypal-cert-url'),
      authAlgo: request.headers.get('paypal-auth-algo'),
      transmissionSig: request.headers.get('paypal-transmission-sig'),
    },
    await getClientAddress(),
  );

  return Response.json(
    { status: result.status },
    { status: PAYMENTS_WEBHOOK_HTTP_STATUS[result.status], headers: BILLING_NO_STORE_HEADERS },
  );
}
