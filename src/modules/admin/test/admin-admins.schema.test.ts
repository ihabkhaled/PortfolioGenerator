import { describe, expect, it } from 'vitest';

import { parseSchema } from '@/packages/zod';

import {
  adminAdminCreateSchema,
  adminAdminIdSchema,
  adminAdminStatusChangeSchema,
} from '../schemas/admin-admins.schema';

describe('adminAdminIdSchema', () => {
  it('accepts a non-empty id', () => {
    expect(parseSchema(adminAdminIdSchema, { adminId: 'admin-1' })).toEqual({
      ok: true,
      value: { adminId: 'admin-1' },
    });
  });

  it('rejects an empty id', () => {
    expect(parseSchema(adminAdminIdSchema, { adminId: '' }).ok).toBe(false);
  });

  it('rejects a missing id', () => {
    expect(parseSchema(adminAdminIdSchema, { adminId: null }).ok).toBe(false);
  });

  it('rejects an id past the length bound', () => {
    expect(parseSchema(adminAdminIdSchema, { adminId: 'a'.repeat(121) }).ok).toBe(false);
  });
});

describe('adminAdminStatusChangeSchema', () => {
  it('accepts ACTIVE', () => {
    expect(
      parseSchema(adminAdminStatusChangeSchema, { adminId: 'admin-1', status: 'ACTIVE' }),
    ).toEqual({ ok: true, value: { adminId: 'admin-1', status: 'ACTIVE' } });
  });

  it('accepts SUSPENDED', () => {
    expect(
      parseSchema(adminAdminStatusChangeSchema, { adminId: 'admin-1', status: 'SUSPENDED' }).ok,
    ).toBe(true);
  });

  it('rejects a status outside the enum', () => {
    expect(
      parseSchema(adminAdminStatusChangeSchema, { adminId: 'admin-1', status: 'DELETED' }).ok,
    ).toBe(false);
  });

  it('rejects a missing adminId', () => {
    expect(parseSchema(adminAdminStatusChangeSchema, { adminId: '', status: 'ACTIVE' }).ok).toBe(
      false,
    );
  });
});

describe('adminAdminCreateSchema', () => {
  const valid = {
    name: 'Amina Yusuf',
    email: 'Amina@Example.com',
    role: 'ADMIN',
    password: 'a-very-long-initial-password',
  };

  it('accepts a valid submission, trimming and lowercasing the email', () => {
    const result = parseSchema(adminAdminCreateSchema, valid);

    expect(result).toEqual({
      ok: true,
      value: { ...valid, email: 'amina@example.com' },
    });
  });

  it('accepts the MODERATOR role', () => {
    expect(parseSchema(adminAdminCreateSchema, { ...valid, role: 'MODERATOR' }).ok).toBe(true);
  });

  it('rejects an empty name with the name-required key', () => {
    const result = parseSchema(adminAdminCreateSchema, { ...valid, name: '  ' });

    expect(result.ok).toBe(false);
    expect(!result.ok && result.issues[0]?.message).toBe('admins.actions.errors.nameRequired');
  });

  it('rejects a malformed email with the invalid-email key', () => {
    const result = parseSchema(adminAdminCreateSchema, { ...valid, email: 'not-an-email' });

    expect(result.ok).toBe(false);
    expect(!result.ok && result.issues[0]?.message).toBe('admins.actions.errors.invalidEmail');
  });

  it('rejects SUPER_ADMIN with the invalid-role key', () => {
    const result = parseSchema(adminAdminCreateSchema, { ...valid, role: 'SUPER_ADMIN' });

    expect(result.ok).toBe(false);
    expect(!result.ok && result.issues[0]?.message).toBe('admins.actions.errors.invalidRole');
  });

  it('rejects a role outside the enum entirely with the invalid-role key', () => {
    const result = parseSchema(adminAdminCreateSchema, { ...valid, role: 'OWNER' });

    expect(result.ok).toBe(false);
    expect(!result.ok && result.issues[0]?.message).toBe('admins.actions.errors.invalidRole');
  });

  it('rejects a password below the floor with the weak-password key', () => {
    const result = parseSchema(adminAdminCreateSchema, { ...valid, password: 'short' });

    expect(result.ok).toBe(false);
    expect(!result.ok && result.issues[0]?.message).toBe('admins.actions.errors.weakPassword');
  });

  it('rejects a password past the ceiling with the weak-password key', () => {
    const result = parseSchema(adminAdminCreateSchema, { ...valid, password: 'a'.repeat(129) });

    expect(result.ok).toBe(false);
    expect(!result.ok && result.issues[0]?.message).toBe('admins.actions.errors.weakPassword');
  });
});
