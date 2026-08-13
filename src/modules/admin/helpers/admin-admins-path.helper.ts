import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import {
  ADMIN_ADMINS_PAGE_PARAM,
  ADMIN_ADMINS_QUERY_PARAM,
} from '../constants/admin-admins.constants';

/**
 * The admins list URL for a given search + page — used by the pagination
 * links so a search, a page number, or both together always land on a URL a
 * share/refresh can reproduce exactly. Mirrors `buildAdminUsersListPath`.
 */
export function buildAdminAdminsListPath(query: string, page: number): string {
  const params = new URLSearchParams();
  const trimmedQuery = query.trim();

  if (trimmedQuery !== '') {
    params.set(ADMIN_ADMINS_QUERY_PARAM, trimmedQuery);
  }

  if (page > 1) {
    params.set(ADMIN_ADMINS_PAGE_PARAM, String(page));
  }

  const queryString = params.toString();

  return queryString === ''
    ? ROUTE_PATHS.managawyAdmins
    : `${ROUTE_PATHS.managawyAdmins}?${queryString}`;
}
