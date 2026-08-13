import type { ReactNode } from 'react';

/**
 * One entry in the `/managawy` nav shell. `href: null` renders as a disabled
 * label rather than a link — every item ships a real route as of Phase 2,
 * but the shape stays nullable for a future item an admin cannot reach yet.
 */
export interface AdminNavItem {
  readonly id: string;
  readonly label: string;
  readonly href: string | null;
}

/** An `AdminNavItem` enriched with whether it matches the request that is rendering it. */
export interface AdminNavItemView extends AdminNavItem {
  readonly isCurrent: boolean;
}

export interface AdminShellProps {
  readonly navItems: readonly AdminNavItemView[];
  readonly brandLabel: string;
  readonly navAriaLabel: string;
  /** The chrome above the nav rail and content — home link, brand, account menu. */
  readonly topBar: ReactNode;
  readonly children: ReactNode;
}

export interface AdminTopBarProps {
  readonly homeHref: string;
  readonly homeLabel: string;
  readonly brandLabel: string;
  /** Reader-owned controls — theme toggle, language switcher. */
  readonly actions: ReactNode;
  readonly accountMenu: ReactNode;
}

export interface AdminAccountMenuProps {
  readonly name: string;
  readonly email: string;
  /** The admin's role, already translated for display — named to avoid the reserved `role` prop. */
  readonly roleName: string;
  readonly menuLabel: string;
  readonly preferencesHref: string;
  readonly preferencesLabel: string;
  readonly changePasswordHref: string;
  readonly changePasswordLabel: string;
  readonly logout: ReactNode;
}
