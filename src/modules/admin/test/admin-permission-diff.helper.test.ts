import { describe, expect, it } from 'vitest';

import {
  buildAdminPermissionDiffMetadata,
  diffAdminPermissions,
  isAdminRbacSelfLockout,
} from '../helpers/admin-permission-diff.helper';

describe('diffAdminPermissions', () => {
  it('reports no change when the sets are identical', () => {
    expect(
      diffAdminPermissions(['USERS_VIEW', 'AUDIT_VIEW'], ['USERS_VIEW', 'AUDIT_VIEW']),
    ).toEqual({
      added: [],
      removed: [],
      changed: false,
    });
  });

  it('reports no change when the sets are identical in a different order', () => {
    expect(
      diffAdminPermissions(['USERS_VIEW', 'AUDIT_VIEW'], ['AUDIT_VIEW', 'USERS_VIEW']),
    ).toEqual({
      added: [],
      removed: [],
      changed: false,
    });
  });

  it('reports an addition', () => {
    expect(diffAdminPermissions(['USERS_VIEW'], ['USERS_VIEW', 'AUDIT_VIEW'])).toEqual({
      added: ['AUDIT_VIEW'],
      removed: [],
      changed: true,
    });
  });

  it('reports a removal', () => {
    expect(diffAdminPermissions(['USERS_VIEW', 'AUDIT_VIEW'], ['USERS_VIEW'])).toEqual({
      added: [],
      removed: ['AUDIT_VIEW'],
      changed: true,
    });
  });

  it('reports both an addition and a removal', () => {
    expect(diffAdminPermissions(['USERS_VIEW'], ['AUDIT_VIEW'])).toEqual({
      added: ['AUDIT_VIEW'],
      removed: ['USERS_VIEW'],
      changed: true,
    });
  });

  it('reports every addition from an empty previous set', () => {
    expect(diffAdminPermissions([], ['USERS_VIEW', 'AUDIT_VIEW'])).toEqual({
      added: ['USERS_VIEW', 'AUDIT_VIEW'],
      removed: [],
      changed: true,
    });
  });

  it('reports every removal against an empty next set', () => {
    expect(diffAdminPermissions(['USERS_VIEW', 'AUDIT_VIEW'], [])).toEqual({
      added: [],
      removed: ['USERS_VIEW', 'AUDIT_VIEW'],
      changed: true,
    });
  });
});

describe('buildAdminPermissionDiffMetadata', () => {
  it('joins added/removed into strings alongside their counts', () => {
    expect(
      buildAdminPermissionDiffMetadata({
        added: ['AUDIT_VIEW', 'RBAC_MANAGE'],
        removed: ['USERS_VIEW'],
        changed: true,
      }),
    ).toEqual({
      added: 'AUDIT_VIEW, RBAC_MANAGE',
      removed: 'USERS_VIEW',
      addedCount: 2,
      removedCount: 1,
      changed: true,
    });
  });

  it('renders empty strings for an unchanged diff', () => {
    expect(buildAdminPermissionDiffMetadata({ added: [], removed: [], changed: false })).toEqual({
      added: '',
      removed: '',
      addedCount: 0,
      removedCount: 0,
      changed: false,
    });
  });
});

describe('isAdminRbacSelfLockout', () => {
  it('refuses when the caller is the target and RBAC_MANAGE is missing from the next set', () => {
    expect(isAdminRbacSelfLockout('admin-1', 'admin-1', ['USERS_VIEW'])).toBe(true);
  });

  it('allows when the caller is the target and RBAC_MANAGE is still present', () => {
    expect(isAdminRbacSelfLockout('admin-1', 'admin-1', ['USERS_VIEW', 'RBAC_MANAGE'])).toBe(false);
  });

  it('allows when the caller is editing a different admin, even without RBAC_MANAGE', () => {
    expect(isAdminRbacSelfLockout('admin-1', 'admin-2', ['USERS_VIEW'])).toBe(false);
  });

  it('allows an empty next set when the caller is editing a different admin', () => {
    expect(isAdminRbacSelfLockout('admin-1', 'admin-2', [])).toBe(false);
  });
});
