import { describe, expect, it } from 'vitest';

import { DEFAULT_ROLE_PERMISSIONS } from '../constants/admin-permission.constants';
import {
  ADMIN_RBAC_PERMISSIONS_ORDER,
  ADMIN_RBAC_ROLES_ORDER,
} from '../constants/admin-rbac.constants';
import {
  buildAdminPermissionMatrixColumns,
  buildAdminPermissionMatrixRows,
} from '../helpers/admin-rbac-matrix.helper';

function translate(key: string, values?: Record<string, string | number>): string {
  return values === undefined ? key : `${key}:${JSON.stringify(values)}`;
}

describe('buildAdminPermissionMatrixColumns', () => {
  it('resolves every role, in the fixed order, to its role label key', () => {
    expect(buildAdminPermissionMatrixColumns(translate)).toEqual([
      { role: 'SUPER_ADMIN', label: 'roles.SUPER_ADMIN' },
      { role: 'ADMIN', label: 'roles.ADMIN' },
      { role: 'MODERATOR', label: 'roles.MODERATOR' },
    ]);
  });
});

describe('buildAdminPermissionMatrixRows', () => {
  const rows = buildAdminPermissionMatrixRows(translate);

  it('produces exactly one row per permission, in the fixed order', () => {
    expect(rows.map((row) => row.permission)).toEqual(ADMIN_RBAC_PERMISSIONS_ORDER);
  });

  it('resolves each row label and description key', () => {
    expect(rows[0]).toMatchObject({
      permission: 'USERS_VIEW',
      label: 'rbac.permissions.USERS_VIEW.label',
      description: 'rbac.permissions.USERS_VIEW.description',
    });
  });

  it('matches DEFAULT_ROLE_PERMISSIONS exactly for every permission/role pair', () => {
    for (const row of rows) {
      for (const grant of row.grants) {
        const expectedGranted = DEFAULT_ROLE_PERMISSIONS[grant.role].includes(row.permission);

        expect(grant.tone).toBe(expectedGranted ? 'success' : 'neutral');
        expect(grant.label).toBe(
          expectedGranted ? 'rbac.matrix.granted' : 'rbac.matrix.notGranted',
        );
      }
    }
  });

  it('carries every role, in the fixed order, on each row', () => {
    for (const row of rows) {
      expect(row.grants.map((grant) => grant.role)).toEqual(ADMIN_RBAC_ROLES_ORDER);
    }
  });

  it('grants every permission to SUPER_ADMIN', () => {
    for (const row of rows) {
      const superAdminGrant = row.grants.find((grant) => grant.role === 'SUPER_ADMIN');

      expect(superAdminGrant?.tone).toBe('success');
    }
  });

  it('does not grant ADMINS_MANAGE or RBAC_MANAGE to MODERATOR', () => {
    const adminsManageRow = rows.find((row) => row.permission === 'ADMINS_MANAGE');
    const rbacManageRow = rows.find((row) => row.permission === 'RBAC_MANAGE');
    const moderatorGrant = (row: (typeof rows)[number] | undefined) =>
      row?.grants.find((grant) => grant.role === 'MODERATOR');

    expect(moderatorGrant(adminsManageRow)?.tone).toBe('neutral');
    expect(moderatorGrant(rbacManageRow)?.tone).toBe('neutral');
  });
});
