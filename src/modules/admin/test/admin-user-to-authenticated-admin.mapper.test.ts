import { describe, expect, it } from 'vitest';

import { toAuthenticatedAdmin } from '../mappers/admin-user-to-authenticated-admin.mapper';

describe('toAuthenticatedAdmin', () => {
  it('maps every field the authorization policy needs', () => {
    const row = {
      id: 'admin-1',
      email: 'admin@example.com',
      name: 'Test Admin',
      role: 'ADMIN' as const,
      permissions: ['USERS_VIEW'] as const,
      isSuperAdmin: false,
      status: 'ACTIVE' as const,
      twoFactorEnabled: true,
      emailVerified: false,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(toAuthenticatedAdmin(row)).toEqual({
      id: 'admin-1',
      email: 'admin@example.com',
      name: 'Test Admin',
      role: 'ADMIN',
      permissions: ['USERS_VIEW'],
      isSuperAdmin: false,
      status: 'ACTIVE',
    });
  });
});
