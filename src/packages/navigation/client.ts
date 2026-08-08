'use client';
// client-boundary-reason: these read the router context, which only exists in
// the browser tree.

/** Owner of `next/navigation`'s client hooks. */

export {
  usePathname as useAppPathname,
  useRouter as useAppRouter,
  useSearchParams as useAppSearchParams,
} from 'next/navigation';
