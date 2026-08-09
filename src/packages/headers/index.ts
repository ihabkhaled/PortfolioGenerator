import 'server-only';

import { cookies, headers } from 'next/headers';

/**
 * Owner of `next/headers`. Request-scoped values are read here so route and
 * layout code never has to know which header carries them.
 */

/** The per-request CSP nonce stamped by src/proxy.ts. */
export async function getRequestNonce(): Promise<string | undefined> {
  const requestHeaders = await headers();

  return requestHeaders.get('x-nonce') ?? undefined;
}

/** Full request headers for server-only vendor facades such as authentication. */
export async function getRequestHeaders(): Promise<Headers> {
  return headers();
}

/** Locale resolved by the request proxy; callers validate it against their domain. */
export async function getRequestLocale(): Promise<string | null> {
  try {
    const requestHeaders = await headers();

    return requestHeaders.get('x-app-locale');
  } catch {
    // Static generation and isolated unit tests have no request context.
    return null;
  }
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

export async function getRequestCookie(name: string): Promise<string | null> {
  const requestCookies = await cookies();

  return requestCookies.get(name)?.value ?? null;
}

export async function setResponseCookie(
  name: string,
  value: string,
  options: {
    readonly httpOnly: boolean;
    readonly maxAge: number;
    readonly secure: boolean;
  },
): Promise<void> {
  const responseCookies = await cookies();
  responseCookies.set(name, value, {
    httpOnly: options.httpOnly,
    maxAge: options.maxAge,
    sameSite: 'lax',
    secure: options.secure,
    path: '/',
  });
}
