import type { TranslateFunction } from '@/packages/i18n';
import { buildPortfolioPath, ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import {
  ADMIN_PORTFOLIO_QUERY_MAX_LENGTH,
  ADMIN_PORTFOLIO_QUERY_PARAMS,
  ADMIN_PORTFOLIO_STATUS_FILTER_MESSAGE_KEYS,
  ADMIN_PORTFOLIO_STATUS_FILTERS,
  ADMIN_PORTFOLIO_STATUS_TONES,
} from '../constants/admin-portfolio.constants';
import { PAGINATION_FIRST_PAGE } from '../constants/pagination.constants';
import type {
  AdminPortfolioFilterOption,
  AdminPortfolioRowViewData,
} from '../types/admin-portfolio-view.types';
import type {
  AdminPortfolioStatusFilter,
  AdminPortfolioSummary,
} from '../types/admin-portfolio.types';

/** True when a raw string is one of the known status-filter values. */
export function isAdminPortfolioStatusFilter(value: string): value is AdminPortfolioStatusFilter {
  return (ADMIN_PORTFOLIO_STATUS_FILTERS as readonly string[]).includes(value);
}

/** A raw `status` query-string value to a safe filter, defaulting to 'ALL'. */
export function parseAdminPortfolioStatusFilter(
  value: string | undefined,
): AdminPortfolioStatusFilter {
  return value !== undefined && isAdminPortfolioStatusFilter(value) ? value : 'ALL';
}

/** A raw `q` query-string value to a trimmed, length-bounded search term. */
export function sanitizeAdminPortfolioQuery(value: string | undefined): string {
  return value === undefined ? '' : value.trim().slice(0, ADMIN_PORTFOLIO_QUERY_MAX_LENGTH);
}

/** Where an owner's own admin detail page lives, for the "owner email" column link. */
export function buildAdminUserDetailHref(userId: string): string {
  return `${ROUTE_PATHS.managawyUsers}/${userId}`;
}

/** `YYYY-MM-DD`, stable across server and client so hydration cannot mismatch. */
export function formatAdminPortfolioDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

/**
 * A search/filter/page combination to the list page's URL.
 *
 * Omits every parameter at its default (empty search, 'ALL' status, page one)
 * so a plain visit to the page and a "reset" both land on the same clean URL
 * rather than one cluttered with `?q=&status=ALL&page=1`.
 */
export function buildAdminPortfolioListHref(
  query: string,
  status: AdminPortfolioStatusFilter,
  page: number,
): string {
  const search = new URLSearchParams();
  const trimmedQuery = query.trim();

  if (trimmedQuery !== '') {
    search.set(ADMIN_PORTFOLIO_QUERY_PARAMS.query, trimmedQuery);
  }

  if (status !== 'ALL') {
    search.set(ADMIN_PORTFOLIO_QUERY_PARAMS.status, status);
  }

  if (page > PAGINATION_FIRST_PAGE) {
    search.set(ADMIN_PORTFOLIO_QUERY_PARAMS.page, String(page));
  }

  const queryString = search.toString();

  return queryString === ''
    ? ROUTE_PATHS.managawyPortfolios
    : `${ROUTE_PATHS.managawyPortfolios}?${queryString}`;
}

/** The status filter's options for the `<select>`, in the fixed, reviewed order. */
export function buildAdminPortfolioStatusOptions(
  translate: TranslateFunction,
): readonly AdminPortfolioFilterOption[] {
  return ADMIN_PORTFOLIO_STATUS_FILTERS.map((filter) => ({
    value: filter,
    label: translate(ADMIN_PORTFOLIO_STATUS_FILTER_MESSAGE_KEYS[filter]),
  }));
}

/**
 * A moderation summary to its table-row view: every link, label and tone the
 * presentational table needs, computed once here rather than inside the
 * (hook-free, logic-free) component.
 */
export function buildAdminPortfolioRowViewData(
  summary: AdminPortfolioSummary,
  translate: TranslateFunction,
): AdminPortfolioRowViewData {
  return {
    id: summary.id,
    slug: summary.slug,
    portfolioHref: buildPortfolioPath(summary.slug),
    ownerId: summary.ownerId,
    ownerEmail: summary.ownerEmail,
    ownerHref: buildAdminUserDetailHref(summary.ownerId),
    statusLabel: translate(ADMIN_PORTFOLIO_STATUS_FILTER_MESSAGE_KEYS[summary.status]),
    statusTone: ADMIN_PORTFOLIO_STATUS_TONES[summary.status],
    isSuspended: summary.isSuspended,
    suspendedLabel: translate(
      summary.isSuspended ? 'portfolios.suspended.yes' : 'portfolios.suspended.no',
    ),
    suspendedTone: summary.isSuspended ? 'danger' : 'neutral',
    updatedAtLabel: formatAdminPortfolioDate(summary.updatedAt),
  };
}
