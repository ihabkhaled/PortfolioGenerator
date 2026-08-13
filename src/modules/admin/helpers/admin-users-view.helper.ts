import { buildPortfolioPath } from '@/shared/constants/route-paths.constants';

import {
  ADMIN_PORTFOLIO_STATUS_BADGE_TONE,
  ADMIN_USER_STATUS_BADGE_TONE,
} from '../constants/admin-users.constants';
import type {
  AdminUserPortfolioRowView,
  AdminUserProfileFieldsView,
  AdminUserRowView,
  AdminUsersPaginationProps,
} from '../types/admin-users-view.types';
import type {
  AdminManagedUser,
  AdminManagedUserDetail,
  AdminManagedUserPortfolio,
  AdminUserSearchResult,
} from '../types/admin-users.types';

import {
  buildAdminPortfoliosSearchPath,
  buildAdminUserDetailPath,
  buildAdminUsersListPath,
} from './admin-users-path.helper';

/** `YYYY-MM-DD`, stable across server and client so hydration cannot mismatch — matches `formatIsoDate` in `src/modules/portfolios/helpers/dashboard-view.helper.ts`. */
export function formatAdminDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function buildAdminUserRowView(
  user: AdminManagedUser,
  translate: (key: string, values?: Record<string, string | number>) => string,
): AdminUserRowView {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    verifiedLabel: translate(user.emailVerified ? 'users.verified.yes' : 'users.verified.no'),
    status: user.status,
    statusBadge: {
      label: translate(`users.status.${user.status}`),
      tone: ADMIN_USER_STATUS_BADGE_TONE[user.status],
    },
    portfolioCountLabel: String(user.portfolioCount),
    joinedLabel: formatAdminDate(user.createdAt),
    detailHref: buildAdminUserDetailPath(user.id),
  };
}

export function buildAdminUserRowViews(
  users: readonly AdminManagedUser[],
  translate: (key: string, values?: Record<string, string | number>) => string,
): readonly AdminUserRowView[] {
  return users.map((user) => buildAdminUserRowView(user, translate));
}

export function buildAdminUsersResultCountLabel(
  result: Pick<AdminUserSearchResult, 'skip' | 'pageSize' | 'totalCount'>,
  translate: (key: string, values?: Record<string, string | number>) => string,
): string {
  if (result.totalCount === 0) {
    return translate('users.list.resultCountEmpty');
  }

  const from = result.skip + 1;
  const to = Math.min(result.skip + result.pageSize, result.totalCount);

  return translate('users.list.resultCount', { from, to, total: result.totalCount });
}

export function buildAdminUsersPaginationView(
  result: Pick<AdminUserSearchResult, 'page' | 'totalPages' | 'hasPrevious' | 'hasNext'>,
  query: string,
  translate: (key: string, values?: Record<string, string | number>) => string,
): AdminUsersPaginationProps {
  return {
    statusLabel: translate('users.list.pageStatus', {
      page: result.page,
      totalPages: result.totalPages,
    }),
    prevHref: result.hasPrevious ? buildAdminUsersListPath(query, result.page - 1) : null,
    nextHref: result.hasNext ? buildAdminUsersListPath(query, result.page + 1) : null,
    prevLabel: translate('users.list.previousPage'),
    nextLabel: translate('users.list.nextPage'),
  };
}

export function buildAdminUserProfileFieldsView(
  user: AdminManagedUserDetail,
  translate: (key: string, values?: Record<string, string | number>) => string,
): AdminUserProfileFieldsView {
  return {
    nameLabel: translate('users.detail.nameLabel'),
    name: user.name,
    emailLabel: translate('users.detail.emailLabel'),
    email: user.email,
    verifiedLabel: translate('users.detail.verifiedLabel'),
    verifiedValue: translate(user.emailVerified ? 'users.verified.yes' : 'users.verified.no'),
    statusLabel: translate('users.detail.statusLabel'),
    statusBadge: {
      label: translate(`users.status.${user.status}`),
      tone: ADMIN_USER_STATUS_BADGE_TONE[user.status],
    },
    joinedLabel: translate('users.detail.joinedLabel'),
    joinedValue: formatAdminDate(user.createdAt),
  };
}

export function buildAdminUserPortfolioRowView(
  portfolio: AdminManagedUserPortfolio,
  translate: (key: string, values?: Record<string, string | number>) => string,
): AdminUserPortfolioRowView {
  return {
    id: portfolio.id,
    slug: portfolio.slug,
    statusBadge: {
      label: translate(`users.portfolioStatus.${portfolio.status}`),
      tone: ADMIN_PORTFOLIO_STATUS_BADGE_TONE[portfolio.status],
    },
    suspendedBadge: portfolio.isSuspended
      ? { label: translate('users.detail.suspendedBadge'), tone: 'danger' }
      : null,
    updatedLabel: formatAdminDate(portfolio.updatedAt),
    publicHref: buildPortfolioPath(portfolio.slug),
    publicLabel: translate('users.detail.viewPublic'),
    adminPortfoliosHref: buildAdminPortfoliosSearchPath(portfolio.slug),
    adminPortfoliosLabel: translate('users.detail.viewInPortfolios'),
  };
}

export function buildAdminUserPortfolioRowViews(
  portfolios: readonly AdminManagedUserPortfolio[],
  translate: (key: string, values?: Record<string, string | number>) => string,
): readonly AdminUserPortfolioRowView[] {
  return portfolios.map((portfolio) => buildAdminUserPortfolioRowView(portfolio, translate));
}
