import { describe, expect, it } from 'vitest';

import { toAdminManagedAdmin } from '../mappers/admin-admin.mapper';
import type { AdminAdminListRow } from '../types/admin-admin-row.types';

describe('toAdminManagedAdmin', () => {
  const row: AdminAdminListRow = {
    id: 'admin-1',
    name: 'Amina Yusuf',
    email: 'amina@example.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    isSuperAdmin: false,
    twoFactorEnabled: true,
    createdAt: new Date('2026-01-15T00:00:00.000Z'),
  };

  it('maps every field through, narrowing role and status to their unions', () => {
    expect(toAdminManagedAdmin(row)).toEqual({
      id: 'admin-1',
      name: 'Amina Yusuf',
      email: 'amina@example.com',
      role: 'ADMIN',
      status: 'ACTIVE',
      isSuperAdmin: false,
      twoFactorEnabled: true,
      createdAt: row.createdAt,
    });
  });

  it('carries the super admin flag and an unenrolled 2FA state through unchanged', () => {
    const superAdminRow: AdminAdminListRow = {
      ...row,
      role: 'SUPER_ADMIN',
      isSuperAdmin: true,
      twoFactorEnabled: false,
    };

    const mapped = toAdminManagedAdmin(superAdminRow);

    expect(mapped.role).toBe('SUPER_ADMIN');
    expect(mapped.isSuperAdmin).toBe(true);
    expect(mapped.twoFactorEnabled).toBe(false);
  });

  it('carries a suspended status through unchanged', () => {
    expect(toAdminManagedAdmin({ ...row, status: 'SUSPENDED' }).status).toBe('SUSPENDED');
  });
});
