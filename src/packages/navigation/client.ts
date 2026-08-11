/**
 * Owner of `next/navigation` — the client-only half.
 *
 * `usePathname` lives here rather than in `./index` because importing it
 * there would make every server component that only wants `appRedirect` pull
 * a client-only hook into a server module, and the error message for that
 * points at this file rather than at the caller.
 */

export { usePathname, useRouter } from 'next/navigation';
