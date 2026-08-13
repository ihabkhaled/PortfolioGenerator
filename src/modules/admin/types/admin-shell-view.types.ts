import type { ReactNode } from 'react';

/**
 * One entry in the `/managawy` nav shell. `href: null` renders as a disabled
 * label rather than a link — Users/Portfolios/Admins/RBAC/Audit Log are
 * visible but not yet built (Phase 2); only Dashboard is a real route.
 */
export interface AdminNavItem {
  readonly id: string;
  readonly label: string;
  readonly href: string | null;
}

export interface AdminShellProps {
  readonly navItems: readonly AdminNavItem[];
  readonly brandLabel: string;
  readonly navAriaLabel: string;
  readonly children: ReactNode;
}
