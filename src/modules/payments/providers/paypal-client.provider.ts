import 'server-only';

import { PAYPAL_TOKEN_REGISTRY } from '../constants/payments-registry.constants';
import { PAYPAL_API_BASE_URL } from '../constants/payments.constants';
import type {
  PaypalAccessToken,
  PaypalClientEnv,
  PaypalRequestInit,
} from '../types/payments.types';

/** Base URL for the configured PayPal environment (sandbox while testing,
 * live in production — see `PAYPAL_ENV` in `.env.example`). */
export function paypalApiBaseUrl(env: Pick<PaypalClientEnv, 'paypalEnv'>): string {
  return PAYPAL_API_BASE_URL[env.paypalEnv];
}

/** Raised on any non-2xx PayPal response. Carries the status and the path
 * only — never the response body, which can echo back request contents this
 * app must not log. */
export class PaypalApiError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(status: number, path: string) {
    super(`PayPal API request to ${path} failed with status ${status}`);
    this.name = 'PaypalApiError';
    this.status = status;
    this.path = path;
  }
}

async function fetchAccessToken(env: PaypalClientEnv): Promise<PaypalAccessToken> {
  const basicAuth = Buffer.from(`${env.clientId}:${env.clientSecret}`).toString('base64');
  const response = await fetch(`${paypalApiBaseUrl(env)}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new PaypalApiError(response.status, '/v1/oauth2/token');
  }

  const body = (await response.json()) as { access_token: string; expires_in: number };

  return {
    accessToken: body.access_token,
    // A 60-second margin before the real expiry, so a request never races the
    // token's last second.
    expiresAt: new Date(Date.now() + (body.expires_in - 60) * 1000),
  };
}

/**
 * OAuth2 client-credentials token, cached in memory for its lifetime.
 *
 * PayPal tokens last roughly eight hours; requesting a fresh one on every
 * call would double every request for no benefit, so it lives in the same
 * process-wide registry pattern the rate limiter uses.
 */
export async function getPaypalAccessToken(env: PaypalClientEnv): Promise<string> {
  const cached = PAYPAL_TOKEN_REGISTRY.value;

  if (cached && cached.expiresAt.getTime() > Date.now()) {
    return cached.accessToken;
  }

  const token = await fetchAccessToken(env);

  PAYPAL_TOKEN_REGISTRY.value = token;

  return token.accessToken;
}

/** Thin authenticated JSON request, the one place every PayPal REST call in
 * this app goes through. */
export async function callPaypalApi<TResponse>(
  env: PaypalClientEnv,
  path: string,
  init: PaypalRequestInit,
): Promise<TResponse> {
  const accessToken = await getPaypalAccessToken(env);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  if (init.idempotencyKey !== undefined) {
    headers['PayPal-Request-Id'] = init.idempotencyKey;
  }

  const response = await fetch(`${paypalApiBaseUrl(env)}${path}`, {
    method: init.method,
    headers,
    // `null`, not `undefined`: `exactOptionalPropertyTypes` treats an
    // explicit `undefined` on an optional property as distinct from omitting
    // it, and `RequestInit['body']` only accepts `BodyInit | null`.
    body: init.body === undefined ? null : JSON.stringify(init.body),
  });

  if (!response.ok) {
    throw new PaypalApiError(response.status, path);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}
