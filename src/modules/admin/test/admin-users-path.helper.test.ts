import { describe, expect, it } from 'vitest';

import {
  buildAdminPortfoliosSearchPath,
  buildAdminUserDetailPath,
  buildAdminUsersListPath,
} from '../helpers/admin-users-path.helper';

describe('buildAdminUserDetailPath', () => {
  it('appends the user id to the users list path', () => {
    expect(buildAdminUserDetailPath('user-42')).toBe('/managawy/users/user-42');
  });
});

describe('buildAdminUsersListPath', () => {
  it('returns the bare list path for an empty query and page 1', () => {
    expect(buildAdminUsersListPath('', 1)).toBe('/managawy/users');
  });

  it('returns the bare list path when the query is only whitespace', () => {
    expect(buildAdminUsersListPath(' '.repeat(3), 1)).toBe('/managawy/users');
  });

  it('carries a non-empty, trimmed query', () => {
    expect(buildAdminUsersListPath('  ada  ', 1)).toBe('/managawy/users?q=ada');
  });

  it('carries a page beyond the first', () => {
    expect(buildAdminUsersListPath('', 3)).toBe('/managawy/users?page=3');
  });

  it('carries both a query and a page beyond the first', () => {
    expect(buildAdminUsersListPath('ada', 2)).toBe('/managawy/users?q=ada&page=2');
  });
});

describe('buildAdminPortfoliosSearchPath', () => {
  it('links to the admin portfolios list pre-filled with the slug', () => {
    expect(buildAdminPortfoliosSearchPath('ada-lovelace')).toBe(
      '/managawy/portfolios?q=ada-lovelace',
    );
  });
});
