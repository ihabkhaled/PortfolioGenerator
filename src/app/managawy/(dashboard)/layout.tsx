import type { ReactElement, ReactNode } from 'react';

import { AdminShell } from '@/modules/admin/admin-ui';
import {
  ADMIN_NAV_ITEMS,
  ADMIN_SHELL_BRAND_LABEL,
  ADMIN_SHELL_NAV_ARIA_LABEL,
  requireAdmin,
} from '@/modules/admin/server';

/**
 * Scoped to the `(dashboard)` route group — a route group rather than a
 * segment folder, so it changes nothing about the URL — deliberately
 * separate from `src/app/managawy/layout.tsx`. `/managawy/sign-in` and
 * `/managawy/two-factor/enroll` sit outside this group precisely so they
 * are never wrapped by `requireAdmin`: an unauthenticated visitor at
 * `/managawy/sign-in`, or a password-only session at
 * `/managawy/two-factor/enroll`, would otherwise be redirected back to the
 * very page they are already on, forever.
 */
export default async function AdminDashboardLayout(props: {
  readonly children: ReactNode;
}): Promise<ReactElement> {
  // A minimum-bar "is this a real, fully authenticated admin" check, not a
  // fine-grained content gate — `USERS_VIEW` is the one permission every
  // role (including MODERATOR) is guaranteed to have by default.
  await requireAdmin('USERS_VIEW');

  return (
    <AdminShell
      navItems={ADMIN_NAV_ITEMS}
      brandLabel={ADMIN_SHELL_BRAND_LABEL}
      navAriaLabel={ADMIN_SHELL_NAV_ARIA_LABEL}
    >
      {props.children}
    </AdminShell>
  );
}
