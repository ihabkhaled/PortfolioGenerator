import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import type { AdminNavItem, AdminNavItemView } from '../types/admin-shell-view.types';

/**
 * A nav item is current for its own route and for anything nested under it
 * (`/managawy/users/42` still highlights `Users`). The dashboard root is the
 * one exception: every other item's URL is also, textually, a path *under*
 * `/managawy`, so a plain prefix match would leave `Dashboard` lit up on
 * every other page too. It only ever matches its own exact path.
 */
export function isAdminNavItemActive(item: AdminNavItem, pathname: string): boolean {
  if (item.href === null) {
    return false;
  }

  if (pathname === item.href) {
    return true;
  }

  return item.href !== ROUTE_PATHS.managawy && pathname.startsWith(`${item.href}/`);
}

/** Enrich the static nav config with which entry matches the current request. */
export function buildAdminNavItemViews(
  items: readonly AdminNavItem[],
  pathname: string,
): readonly AdminNavItemView[] {
  return items.map((item) => ({ ...item, isCurrent: isAdminNavItemActive(item, pathname) }));
}
