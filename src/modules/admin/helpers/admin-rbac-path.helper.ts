import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import {
  ADMIN_RBAC_ADMIN_ID_PARAM,
  ADMIN_RBAC_PAGE_PARAM,
  ADMIN_RBAC_QUERY_PARAM,
} from '../constants/admin-rbac.constants';

/**
 * The RBAC page's URL for a given search, page, and selected admin.
 *
 * One function covers every link this screen renders: the search form's
 * (implicit) submit target, the picker's pagination controls, each row's
 * "Edit permissions" link, and the editor's "choose a different admin" link
 * — the last two are just this same builder called with `adminId` set or
 * `null`. Pagination links pass the currently selected admin through so
 * paging the picker never closes the editor underneath it.
 */
export function buildAdminRbacListPath(
  query: string,
  page: number,
  adminId: string | null,
): string {
  const params = new URLSearchParams();
  const trimmedQuery = query.trim();

  if (trimmedQuery !== '') {
    params.set(ADMIN_RBAC_QUERY_PARAM, trimmedQuery);
  }

  if (page > 1) {
    params.set(ADMIN_RBAC_PAGE_PARAM, String(page));
  }

  if (adminId !== null && adminId.trim() !== '') {
    params.set(ADMIN_RBAC_ADMIN_ID_PARAM, adminId);
  }

  const queryString = params.toString();

  return queryString === ''
    ? ROUTE_PATHS.managawyRbac
    : `${ROUTE_PATHS.managawyRbac}?${queryString}`;
}
