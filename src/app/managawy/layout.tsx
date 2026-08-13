import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';

import { AdminShell } from '@/modules/admin/admin-ui';
import {
  ADMIN_NAV_ITEMS,
  ADMIN_SHELL_BRAND_LABEL,
  ADMIN_SHELL_NAV_ARIA_LABEL,
  requireAdmin,
} from '@/modules/admin/server';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout(props: {
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
