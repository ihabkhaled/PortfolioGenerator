import { describe, expect, it } from 'vitest';

import { parseSchema } from '@/packages/zod';

import { adminUserIdSchema, adminUserStatusChangeSchema } from '../schemas/admin-users.schema';

describe('adminUserIdSchema', () => {
  it('accepts a non-empty id', () => {
    expect(parseSchema(adminUserIdSchema, { userId: 'user-1' })).toEqual({
      ok: true,
      value: { userId: 'user-1' },
    });
  });

  it('rejects an empty id', () => {
    expect(parseSchema(adminUserIdSchema, { userId: '' }).ok).toBe(false);
  });

  it('rejects a missing id', () => {
    expect(parseSchema(adminUserIdSchema, { userId: null }).ok).toBe(false);
  });

  it('rejects an id past the length bound', () => {
    expect(parseSchema(adminUserIdSchema, { userId: 'a'.repeat(121) }).ok).toBe(false);
  });
});

describe('adminUserStatusChangeSchema', () => {
  it('accepts ACTIVE', () => {
    expect(
      parseSchema(adminUserStatusChangeSchema, { userId: 'user-1', status: 'ACTIVE' }),
    ).toEqual({
      ok: true,
      value: { userId: 'user-1', status: 'ACTIVE' },
    });
  });

  it('accepts SUSPENDED', () => {
    const result = parseSchema(adminUserStatusChangeSchema, {
      userId: 'user-1',
      status: 'SUSPENDED',
    });

    expect(result).toEqual({ ok: true, value: { userId: 'user-1', status: 'SUSPENDED' } });
  });

  it('rejects a status outside the enum', () => {
    expect(
      parseSchema(adminUserStatusChangeSchema, { userId: 'user-1', status: 'DELETED' }).ok,
    ).toBe(false);
  });

  it('rejects a missing userId', () => {
    expect(parseSchema(adminUserStatusChangeSchema, { userId: '', status: 'ACTIVE' }).ok).toBe(
      false,
    );
  });
});
