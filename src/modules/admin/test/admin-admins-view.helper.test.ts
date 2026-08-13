import { describe, expect, it } from 'vitest';

import {
  buildAdminAdminRoleOptions,
  buildAdminAdminRowView,
  buildAdminAdminRowViews,
  buildAdminAdminsPaginationView,
  buildAdminAdminsResultCountLabel,
} from '../helpers/admin-admins-view.helper';
import type { AdminManagedAdmin } from '../types/admin-admins.types';

function translate(key: string, values?: Record<string, string | number>): string {
  return values === undefined ? key : `${key}:${JSON.stringify(values)}`;
}

const baseAdmin: AdminManagedAdmin = {
  id: 'admin-1',
  name: 'Amina Yusuf',
  email: 'amina@example.com',
  role: 'ADMIN',
  status: 'ACTIVE',
  isSuperAdmin: false,
  twoFactorEnabled: true,
  createdAt: new Date('2026-01-15T00:00:00.000Z'),
};

describe('buildAdminAdminRowView', () => {
  it('resolves an active, 2FA-enrolled, non-super-admin row for a different caller', () => {
    expect(buildAdminAdminRowView(baseAdmin, 'admin-2', translate)).toEqual({
      id: 'admin-1',
      name: 'Amina Yusuf',
      email: 'amina@example.com',
      roleLabel: 'roles.ADMIN',
      status: 'ACTIVE',
      statusBadge: { label: 'admins.status.ACTIVE', tone: 'success' },
      twoFactorLabel: 'admins.list.twoFactor.yes',
      joinedLabel: '2026-01-15',
      isSuperAdmin: false,
      isSelf: false,
    });
  });

  it('marks the row as belonging to the caller when the ids match', () => {
    expect(buildAdminAdminRowView(baseAdmin, 'admin-1', translate).isSelf).toBe(true);
  });

  it('resolves a suspended, unenrolled super admin row', () => {
    const admin: AdminManagedAdmin = {
      ...baseAdmin,
      role: 'SUPER_ADMIN',
      status: 'SUSPENDED',
      isSuperAdmin: true,
      twoFactorEnabled: false,
    };

    expect(buildAdminAdminRowView(admin, 'admin-2', translate)).toMatchObject({
      roleLabel: 'roles.SUPER_ADMIN',
      statusBadge: { label: 'admins.status.SUSPENDED', tone: 'danger' },
      twoFactorLabel: 'admins.list.twoFactor.no',
      isSuperAdmin: true,
    });
  });
});

describe('buildAdminAdminRowViews', () => {
  it('maps every admin in order', () => {
    const second: AdminManagedAdmin = { ...baseAdmin, id: 'admin-2', name: 'Grace Hopper' };

    expect(
      buildAdminAdminRowViews([baseAdmin, second], 'admin-9', translate).map((row) => row.id),
    ).toEqual(['admin-1', 'admin-2']);
  });
});

describe('buildAdminAdminsResultCountLabel', () => {
  it('reports the empty-result key when there are no rows', () => {
    expect(
      buildAdminAdminsResultCountLabel({ skip: 0, pageSize: 20, totalCount: 0 }, translate),
    ).toBe('admins.list.resultCountEmpty');
  });

  it('reports a from/to/total range within a full page', () => {
    expect(
      buildAdminAdminsResultCountLabel({ skip: 20, pageSize: 20, totalCount: 45 }, translate),
    ).toBe('admins.list.resultCount:{"from":21,"to":40,"total":45}');
  });

  it('clips the upper bound to the total on a partial last page', () => {
    expect(
      buildAdminAdminsResultCountLabel({ skip: 40, pageSize: 20, totalCount: 45 }, translate),
    ).toBe('admins.list.resultCount:{"from":41,"to":45,"total":45}');
  });
});

describe('buildAdminAdminsPaginationView', () => {
  it('produces null hrefs at both boundaries on a single-page result', () => {
    const view = buildAdminAdminsPaginationView(
      { page: 1, totalPages: 1, hasPrevious: false, hasNext: false },
      '',
      translate,
    );

    expect(view.prevHref).toBeNull();
    expect(view.nextHref).toBeNull();
    expect(view.statusLabel).toBe('admins.list.pageStatus:{"page":1,"totalPages":1}');
  });

  it('links both directions from a middle page, preserving the query', () => {
    const view = buildAdminAdminsPaginationView(
      { page: 2, totalPages: 3, hasPrevious: true, hasNext: true },
      'amina',
      translate,
    );

    expect(view.prevHref).toBe('/managawy/admins?q=amina');
    expect(view.nextHref).toBe('/managawy/admins?q=amina&page=3');
  });
});

describe('buildAdminAdminRoleOptions', () => {
  it('offers exactly ADMIN and MODERATOR, never SUPER_ADMIN', () => {
    expect(buildAdminAdminRoleOptions(translate)).toEqual([
      { value: 'ADMIN', label: 'roles.ADMIN' },
      { value: 'MODERATOR', label: 'roles.MODERATOR' },
    ]);
  });
});
