import 'server-only';

import { headers } from 'next/headers';

/**
 * Owner of `next/headers`. Request-scoped values are read here so route and
 * layout code never has to know which header carries them.
 */

/** The per-request CSP nonce stamped by src/proxy.ts. */
export async function getRequestNonce(): Promise<string | undefined> {
  const requestHeaders = await headers();

  return requestHeaders.get('x-nonce') ?? undefined;
}

/**
 * Best-effort client address for IP-scoped rate limiting.
 *
 * A client can forge `x-forwarded-for`, so this is a secondary signal only:
 * quotas that matter are keyed on the authenticated user. The left-most entry
 * is used because that is the convention proxies prepend to.
 */
export async function getClientAddress(): Promise<string> {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get('x-forwarded-for');

  if (forwarded) {
    const [first] = forwarded.split(',', 1);

    if (first?.trim()) {
      return first.trim();
    }
  }

  return requestHeaders.get('x-real-ip') ?? 'unknown';
}
