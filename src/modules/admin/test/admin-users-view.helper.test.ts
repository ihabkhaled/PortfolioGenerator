import { describe, expect, it } from 'vitest';

import {
  buildAdminUserPortfolioRowView,
  buildAdminUserPortfolioRowViews,
  buildAdminUserProfileFieldsView,
  buildAdminUserRowView,
  buildAdminUserRowViews,
  buildAdminUsersPaginationView,
  buildAdminUsersResultCountLabel,
  formatAdminDate,
} from '../helpers/admin-users-view.helper';
import type {
  AdminManagedUser,
  AdminManagedUserDetail,
  AdminManagedUserPortfolio,
} from '../types/admin-users.types';

function translate(key: string, values?: Record<string, string | number>): string {
  return values === undefined ? key : `${key}:${JSON.stringify(values)}`;
}

const baseUser: AdminManagedUser = {
  id: 'user-1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  emailVerified: true,
  status: 'ACTIVE',
  portfolioCount: 2,
  createdAt: new Date('2024-01-15T00:00:00.000Z'),
};

const baseUserDetail: AdminManagedUserDetail = {
  id: 'user-1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  emailVerified: true,
  status: 'ACTIVE',
  createdAt: new Date('2024-01-15T00:00:00.000Z'),
};

const basePortfolio: AdminManagedUserPortfolio = {
  id: 'portfolio-1',
  slug: 'ada',
  status: 'PUBLISHED',
  isSuspended: false,
  publishedAt: new Date('2024-02-01T00:00:00.000Z'),
  updatedAt: new Date('2024-02-05T00:00:00.000Z'),
};

describe('formatAdminDate', () => {
  it('formats as YYYY-MM-DD', () => {
    expect(formatAdminDate(new Date('2024-01-15T13:45:00.000Z'))).toBe('2024-01-15');
  });
});

describe('buildAdminUserRowView', () => {
  it('resolves a verified, active user', () => {
    expect(buildAdminUserRowView(baseUser, translate)).toEqual({
      id: 'user-1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      verifiedLabel: 'users.verified.yes',
      status: 'ACTIVE',
      statusBadge: { label: 'users.status.ACTIVE', tone: 'success' },
      portfolioCountLabel: '2',
      joinedLabel: '2024-01-15',
      detailHref: '/managawy/users/user-1',
    });
  });

  it('resolves an unverified, suspended user', () => {
    const user: AdminManagedUser = { ...baseUser, emailVerified: false, status: 'SUSPENDED' };

    expect(buildAdminUserRowView(user, translate)).toMatchObject({
      verifiedLabel: 'users.verified.no',
      status: 'SUSPENDED',
      statusBadge: { label: 'users.status.SUSPENDED', tone: 'danger' },
    });
  });
});

describe('buildAdminUserRowViews', () => {
  it('maps every user in order', () => {
    const second: AdminManagedUser = { ...baseUser, id: 'user-2', name: 'Grace Hopper' };

    expect(buildAdminUserRowViews([baseUser, second], translate).map((row) => row.id)).toEqual([
      'user-1',
      'user-2',
    ]);
  });
});

describe('buildAdminUsersResultCountLabel', () => {
  it('reports the empty-result key when there are no rows', () => {
    expect(
      buildAdminUsersResultCountLabel({ skip: 0, pageSize: 20, totalCount: 0 }, translate),
    ).toBe('users.list.resultCountEmpty');
  });

  it('reports a from/to/total range within a full page', () => {
    expect(
      buildAdminUsersResultCountLabel({ skip: 20, pageSize: 20, totalCount: 45 }, translate),
    ).toBe('users.list.resultCount:{"from":21,"to":40,"total":45}');
  });

  it('clips the upper bound to the total on a partial last page', () => {
    expect(
      buildAdminUsersResultCountLabel({ skip: 40, pageSize: 20, totalCount: 45 }, translate),
    ).toBe('users.list.resultCount:{"from":41,"to":45,"total":45}');
  });
});

describe('buildAdminUsersPaginationView', () => {
  it('produces null hrefs at both boundaries on a single-page result', () => {
    const view = buildAdminUsersPaginationView(
      { page: 1, totalPages: 1, hasPrevious: false, hasNext: false },
      '',
      translate,
    );

    expect(view.prevHref).toBeNull();
    expect(view.nextHref).toBeNull();
    expect(view.statusLabel).toBe('users.list.pageStatus:{"page":1,"totalPages":1}');
  });

  it('links both directions from a middle page, preserving the query', () => {
    const view = buildAdminUsersPaginationView(
      { page: 2, totalPages: 3, hasPrevious: true, hasNext: true },
      'ada',
      translate,
    );

    expect(view.prevHref).toBe('/managawy/users?q=ada');
    expect(view.nextHref).toBe('/managawy/users?q=ada&page=3');
  });
});

describe('buildAdminUserProfileFieldsView', () => {
  it('resolves a verified user', () => {
    expect(buildAdminUserProfileFieldsView(baseUserDetail, translate)).toEqual({
      nameLabel: 'users.detail.nameLabel',
      name: 'Ada Lovelace',
      emailLabel: 'users.detail.emailLabel',
      email: 'ada@example.com',
      verifiedLabel: 'users.detail.verifiedLabel',
      verifiedValue: 'users.verified.yes',
      statusLabel: 'users.detail.statusLabel',
      statusBadge: { label: 'users.status.ACTIVE', tone: 'success' },
      joinedLabel: 'users.detail.joinedLabel',
      joinedValue: '2024-01-15',
    });
  });

  it('resolves an unverified user', () => {
    const user: AdminManagedUserDetail = { ...baseUserDetail, emailVerified: false };

    expect(buildAdminUserProfileFieldsView(user, translate).verifiedValue).toBe(
      'users.verified.no',
    );
  });
});

describe('buildAdminUserPortfolioRowView', () => {
  it('carries no suspended badge for an active portfolio', () => {
    const view = buildAdminUserPortfolioRowView(basePortfolio, translate);

    expect(view.suspendedBadge).toBeNull();
    expect(view.statusBadge).toEqual({ label: 'users.portfolioStatus.PUBLISHED', tone: 'success' });
    expect(view.publicHref).toBe('/portfolios/ada');
    expect(view.adminPortfoliosHref).toBe('/managawy/portfolios?q=ada');
  });

  it('adds a suspended badge for a suspended portfolio', () => {
    const portfolio: AdminManagedUserPortfolio = { ...basePortfolio, isSuspended: true };

    expect(buildAdminUserPortfolioRowView(portfolio, translate).suspendedBadge).toEqual({
      label: 'users.detail.suspendedBadge',
      tone: 'danger',
    });
  });
});

describe('buildAdminUserPortfolioRowViews', () => {
  it('maps every portfolio in order', () => {
    const second: AdminManagedUserPortfolio = {
      ...basePortfolio,
      id: 'portfolio-2',
      slug: 'grace',
    };

    expect(
      buildAdminUserPortfolioRowViews([basePortfolio, second], translate).map((row) => row.id),
    ).toEqual(['portfolio-1', 'portfolio-2']);
  });
});
