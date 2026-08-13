import { describe, expect, it } from 'vitest';

import {
  buildAdminPermissionCheckboxRows,
  buildAdminRbacPaginationView,
  buildAdminRbacPickerRowView,
  buildAdminRbacPickerRowViews,
  buildAdminRbacResultCountLabel,
} from '../helpers/admin-rbac-view.helper';
import type { AuthenticatedAdmin } from '../types/admin.types';

function translate(key: string, values?: Record<string, string | number>): string {
  return values === undefined ? key : `${key}:${JSON.stringify(values)}`;
}

const baseAdmin: AuthenticatedAdmin = {
  id: 'admin-1',
  email: 'ada@example.com',
  name: 'Ada Lovelace',
  role: 'MODERATOR',
  permissions: ['USERS_VIEW', 'USERS_SUSPEND'],
  isSuperAdmin: false,
  status: 'ACTIVE',
};

describe('buildAdminRbacPickerRowView', () => {
  it('resolves an unselected row', () => {
    expect(buildAdminRbacPickerRowView(baseAdmin, '', 1, null, translate)).toEqual({
      id: 'admin-1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      roleLabel: 'roles.MODERATOR',
      permissionCountLabel: 'rbac.picker.permissionCount:{"count":2}',
      isSelected: false,
      editHref: '/managawy/rbac?adminId=admin-1',
      editLabel: 'rbac.picker.edit',
      selectedLabel: 'rbac.picker.editing',
    });
  });

  it('marks the row selected when its id matches the selected admin', () => {
    expect(buildAdminRbacPickerRowView(baseAdmin, '', 1, 'admin-1', translate).isSelected).toBe(
      true,
    );
  });

  it('preserves query and page in the edit link', () => {
    expect(buildAdminRbacPickerRowView(baseAdmin, 'ada', 2, null, translate).editHref).toBe(
      '/managawy/rbac?q=ada&page=2&adminId=admin-1',
    );
  });
});

describe('buildAdminRbacPickerRowViews', () => {
  it('maps every admin in order', () => {
    const second: AuthenticatedAdmin = { ...baseAdmin, id: 'admin-2', name: 'Grace Hopper' };

    expect(
      buildAdminRbacPickerRowViews([baseAdmin, second], '', 1, null, translate).map(
        (row) => row.id,
      ),
    ).toEqual(['admin-1', 'admin-2']);
  });
});

describe('buildAdminRbacResultCountLabel', () => {
  it('reports the empty-result key when there are no rows', () => {
    expect(
      buildAdminRbacResultCountLabel({ skip: 0, pageSize: 10, totalCount: 0 }, translate),
    ).toBe('rbac.picker.resultCountEmpty');
  });

  it('reports a from/to/total range within a full page', () => {
    expect(
      buildAdminRbacResultCountLabel({ skip: 10, pageSize: 10, totalCount: 25 }, translate),
    ).toBe('rbac.picker.resultCount:{"from":11,"to":20,"total":25}');
  });

  it('clips the upper bound to the total on a partial last page', () => {
    expect(
      buildAdminRbacResultCountLabel({ skip: 20, pageSize: 10, totalCount: 25 }, translate),
    ).toBe('rbac.picker.resultCount:{"from":21,"to":25,"total":25}');
  });
});

describe('buildAdminRbacPaginationView', () => {
  it('produces null hrefs at both boundaries on a single-page result', () => {
    const view = buildAdminRbacPaginationView(
      { page: 1, totalPages: 1, hasPrevious: false, hasNext: false },
      '',
      null,
      translate,
    );

    expect(view.prevHref).toBeNull();
    expect(view.nextHref).toBeNull();
    expect(view.statusLabel).toBe('rbac.picker.pageStatus:{"page":1,"totalPages":1}');
  });

  it('links both directions from a middle page, preserving the query and selected admin', () => {
    const view = buildAdminRbacPaginationView(
      { page: 2, totalPages: 3, hasPrevious: true, hasNext: true },
      'ada',
      'admin-1',
      translate,
    );

    expect(view.prevHref).toBe('/managawy/rbac?q=ada&adminId=admin-1');
    expect(view.nextHref).toBe('/managawy/rbac?q=ada&page=3&adminId=admin-1');
  });
});

describe('buildAdminPermissionCheckboxRows', () => {
  it('checks exactly the permissions the target currently holds, unlocked for a different admin', () => {
    const rows = buildAdminPermissionCheckboxRows(
      ['USERS_VIEW', 'RBAC_MANAGE'],
      'caller-1',
      'target-1',
      translate,
    );

    expect(rows).toHaveLength(10);
    expect(rows.find((row) => row.permission === 'USERS_VIEW')).toMatchObject({
      checked: true,
      locked: false,
    });
    expect(rows.find((row) => row.permission === 'RBAC_MANAGE')).toMatchObject({
      checked: true,
      locked: false,
    });
    expect(rows.find((row) => row.permission === 'AUDIT_VIEW')).toMatchObject({
      checked: false,
      locked: false,
    });
  });

  it('locks only RBAC_MANAGE when the caller is editing their own account', () => {
    const rows = buildAdminPermissionCheckboxRows(['RBAC_MANAGE'], 'admin-1', 'admin-1', translate);

    expect(rows.find((row) => row.permission === 'RBAC_MANAGE')).toMatchObject({
      checked: true,
      locked: true,
    });
    expect(rows.find((row) => row.permission === 'USERS_VIEW')).toMatchObject({
      checked: false,
      locked: false,
    });
  });

  it('resolves each row label and description key', () => {
    const rows = buildAdminPermissionCheckboxRows([], 'caller-1', 'target-1', translate);

    expect(rows[0]).toMatchObject({
      permission: 'USERS_VIEW',
      label: 'rbac.permissions.USERS_VIEW.label',
      description: 'rbac.permissions.USERS_VIEW.description',
    });
  });
});
