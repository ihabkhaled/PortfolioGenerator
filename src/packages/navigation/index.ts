/**
 * Owner of `next/navigation` — the server-safe half.
 *
 * `usePathname`/`useRouter`/`useSearchParams` live in `./client` because
 * importing them here would make every server component that wants a redirect
 * pull a client-only API into a server module, and the error message for that
 * points at this file rather than at the caller.
 *
 * `appNotFound` and `appRedirect` keep explicit `never` return types so callers
 * can use them as terminating statements without losing the control-flow
 * narrowing that makes "unpublished portfolio" paths provably unreachable
 * afterwards. `appRedirect` takes a typed `Route`, so redirecting to a path
 * that no longer exists is a compile error rather than a 404 a user finds
 * mid-signup.
 */

import type { Route } from 'next';
import { notFound, redirect } from 'next/navigation';

export function appNotFound(): never {
  notFound();
}

export function appRedirect(path: Route): never {
  redirect(path);
}

export { type Route } from 'next';
