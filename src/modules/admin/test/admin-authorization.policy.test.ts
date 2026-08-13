import { describe, expect, it } from 'vitest';

import {
  assertNotSelfTarget,
  assertNotSuperAdmin,
  hasAdminPermission,
} from '../policies/admin-authorization.policy';
import type { AuthenticatedAdmin } from '../types/admin.types';

function buildAdmin(overrides: Partial<AuthenticatedAdmin> = {}): AuthenticatedAdmin {
  return {
    id: 'admin-1',
    email: 'moderator@example.com',
    name: 'Test Moderator',
    role: 'MODERATOR',
    permissions: ['USERS_VIEW', 'USERS_SUSPEND'],
    isSuperAdmin: false,
    status: 'ACTIVE',
    ...overrides,
  };
}

describe('hasAdminPermission', () => {
  it('allows a permission the admin was granted', () => {
    expect(hasAdminPermission(buildAdmin(), 'USERS_VIEW')).toBe(true);
  });

  it('refuses a permission the admin was not granted', () => {
    expect(hasAdminPermission(buildAdmin(), 'ADMINS_MANAGE')).toBe(false);
  });

  it('a super admin has every permission regardless of the granted list', () => {
    const admin = buildAdmin({ isSuperAdmin: true, permissions: [] });

    expect(hasAdminPermission(admin, 'ADMINS_MANAGE')).toBe(true);
    expect(hasAdminPermission(admin, 'RBAC_MANAGE')).toBe(true);
  });

  it('refuses every permission for a suspended admin, even the super admin', () => {
    const admin = buildAdmin({ isSuperAdmin: true, status: 'SUSPENDED' });

    expect(hasAdminPermission(admin, 'USERS_VIEW')).toBe(false);
  });
});

describe('assertNotSuperAdmin', () => {
  it('throws when the target is the super admin', () => {
    expect(() => {
      assertNotSuperAdmin({ isSuperAdmin: true });
    }).toThrow();
  });

  it('does nothing when the target is not the super admin', () => {
    expect(() => {
      assertNotSuperAdmin({ isSuperAdmin: false });
    }).not.toThrow();
  });
});

describe('assertNotSelfTarget', () => {
  it('throws when the caller and the target are the same admin', () => {
    expect(() => {
      assertNotSelfTarget('admin-1', 'admin-1');
    }).toThrow();
  });

  it('does nothing when the target is a different admin', () => {
    expect(() => {
      assertNotSelfTarget('admin-1', 'admin-2');
    }).not.toThrow();
  });
});
