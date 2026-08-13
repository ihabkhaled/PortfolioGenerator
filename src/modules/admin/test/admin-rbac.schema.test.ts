import { describe, expect, it } from 'vitest';

import { parseSchema } from '@/packages/zod';

import { adminRbacPermissionsUpdateSchema } from '../schemas/admin-rbac.schema';

describe('adminRbacPermissionsUpdateSchema', () => {
  it('accepts a valid admin id with a non-empty permission set', () => {
    expect(
      parseSchema(adminRbacPermissionsUpdateSchema, {
        adminId: 'admin-1',
        permissions: ['USERS_VIEW', 'RBAC_MANAGE'],
      }),
    ).toEqual({
      ok: true,
      value: { adminId: 'admin-1', permissions: ['USERS_VIEW', 'RBAC_MANAGE'] },
    });
  });

  it('accepts an empty permission set', () => {
    expect(
      parseSchema(adminRbacPermissionsUpdateSchema, { adminId: 'admin-1', permissions: [] }),
    ).toEqual({
      ok: true,
      value: { adminId: 'admin-1', permissions: [] },
    });
  });

  it('rejects a permission outside the known set', () => {
    expect(
      parseSchema(adminRbacPermissionsUpdateSchema, {
        adminId: 'admin-1',
        permissions: ['NOT_A_REAL_PERMISSION'],
      }).ok,
    ).toBe(false);
  });

  it('rejects an empty admin id', () => {
    expect(parseSchema(adminRbacPermissionsUpdateSchema, { adminId: '', permissions: [] }).ok).toBe(
      false,
    );
  });

  it('rejects a missing admin id', () => {
    expect(parseSchema(adminRbacPermissionsUpdateSchema, { permissions: [] }).ok).toBe(false);
  });

  it('rejects an admin id past the length bound', () => {
    expect(
      parseSchema(adminRbacPermissionsUpdateSchema, {
        adminId: 'a'.repeat(121),
        permissions: [],
      }).ok,
    ).toBe(false);
  });
});
