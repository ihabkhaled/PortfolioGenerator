import { describe, expect, it } from 'vitest';

import { buildAdminNavItemViews, isAdminNavItemActive } from '../helpers/admin-nav.helper';
import type { AdminNavItem } from '../types/admin-shell-view.types';

const DASHBOARD: AdminNavItem = { id: 'dashboard', label: 'Dashboard', href: '/managawy' };
const USERS: AdminNavItem = { id: 'users', label: 'Users', href: '/managawy/users' };
const DISABLED: AdminNavItem = { id: 'rbac', label: 'RBAC', href: null };

describe('isAdminNavItemActive', () => {
  it('matches the dashboard root only on its exact path', () => {
    expect(isAdminNavItemActive(DASHBOARD, '/managawy')).toBe(true);
    expect(isAdminNavItemActive(DASHBOARD, '/managawy/users')).toBe(false);
  });

  it('matches a nested item on its own path and on anything beneath it', () => {
    expect(isAdminNavItemActive(USERS, '/managawy/users')).toBe(true);
    expect(isAdminNavItemActive(USERS, '/managawy/users/42')).toBe(true);
    expect(isAdminNavItemActive(USERS, '/managawy/users-archive')).toBe(false);
    expect(isAdminNavItemActive(USERS, '/managawy')).toBe(false);
  });

  it('a disabled item with no href is never current', () => {
    expect(isAdminNavItemActive(DISABLED, '/managawy/rbac')).toBe(false);
  });
});

describe('buildAdminNavItemViews', () => {
  it('marks exactly the item matching the current request', () => {
    const views = buildAdminNavItemViews([DASHBOARD, USERS, DISABLED], '/managawy/users/42');

    expect(views).toEqual([
      { ...DASHBOARD, isCurrent: false },
      { ...USERS, isCurrent: true },
      { ...DISABLED, isCurrent: false },
    ]);
  });

  it('marks nothing current when the request matches no item', () => {
    const views = buildAdminNavItemViews([DASHBOARD, USERS], '/managawy/portfolios');

    expect(views.every((view) => !view.isCurrent)).toBe(true);
  });
});
