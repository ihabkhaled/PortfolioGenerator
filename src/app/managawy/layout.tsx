import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * The root of every `/managawy` route. Deliberately does nothing beyond
 * `noindex` metadata: `requireAdmin` and the `AdminShell` chrome live one
 * level down, in `(dashboard)/layout.tsx`, scoped to the routes that
 * actually need a fully authenticated, 2FA-enrolled admin — `/managawy/
 * sign-in` and `/managawy/two-factor/enroll` sit outside that group and
 * must never be gated by it (see the comment there for why).
 */
export default function AdminRootLayout(props: { readonly children: ReactNode }): ReactNode {
  return props.children;
}
