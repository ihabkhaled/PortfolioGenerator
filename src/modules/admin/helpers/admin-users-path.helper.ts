import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import {
  ADMIN_USERS_PAGE_PARAM,
  ADMIN_USERS_QUERY_PARAM,
} from '../constants/admin-users.constants';

export function buildAdminUserDetailPath(userId: string): string {
  return `${ROUTE_PATHS.managawyUsers}/${userId}`;
}

/**
 * The users list URL for a given search + page — used by the search form's
 * (implicit) GET submission target and by the pagination links, so a search,
 * a page number, or both together always land on a URL a share/refresh can
 * reproduce exactly.
 */
export function buildAdminUsersListPath(query: string, page: number): string {
  const params = new URLSearchParams();
  const trimmedQuery = query.trim();

  if (trimmedQuery !== '') {
    params.set(ADMIN_USERS_QUERY_PARAM, trimmedQuery);
  }

  if (page > 1) {
    params.set(ADMIN_USERS_PAGE_PARAM, String(page));
  }

  const queryString = params.toString();

  return queryString === ''
    ? ROUTE_PATHS.managawyUsers
    : `${ROUTE_PATHS.managawyUsers}?${queryString}`;
}

/**
 * A link from a user's portfolio row to the admin portfolios screen,
 * pre-filled with that portfolio's slug. The portfolios page owns its own
 * search query-string contract; if its param name ever differs from this
 * one, the link still lands an admin on the portfolios list — just unfiltered
 * — rather than on a broken route.
 */
export function buildAdminPortfoliosSearchPath(slug: string): string {
  const params = new URLSearchParams({ [ADMIN_USERS_QUERY_PARAM]: slug });

  return `${ROUTE_PATHS.managawyPortfolios}?${params.toString()}`;
}
