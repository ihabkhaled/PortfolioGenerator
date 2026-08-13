import { describe, expect, it } from 'vitest';

import { resolveAdminAuditActionLabel } from '../helpers/admin-audit-action.helper';

const translate = (key: string): string => `translated:${key}`;

describe('resolveAdminAuditActionLabel', () => {
  it('translates every known action code', () => {
    expect(resolveAdminAuditActionLabel('admin.session.created', translate)).toBe(
      'translated:auditLog.actions.sessionCreated',
    );
    expect(resolveAdminAuditActionLabel('admin.session.signed_out', translate)).toBe(
      'translated:auditLog.actions.sessionSignedOut',
    );
    expect(resolveAdminAuditActionLabel('admin.two_factor.enrolled', translate)).toBe(
      'translated:auditLog.actions.twoFactorEnrolled',
    );
    expect(resolveAdminAuditActionLabel('admin.two_factor.verified', translate)).toBe(
      'translated:auditLog.actions.twoFactorVerified',
    );
    expect(resolveAdminAuditActionLabel('admin.password.changed', translate)).toBe(
      'translated:auditLog.actions.passwordChanged',
    );
    expect(resolveAdminAuditActionLabel('admin.user.suspended', translate)).toBe(
      'translated:auditLog.actions.userSuspended',
    );
    expect(resolveAdminAuditActionLabel('admin.user.activated', translate)).toBe(
      'translated:auditLog.actions.userActivated',
    );
    expect(resolveAdminAuditActionLabel('admin.user.password_reset_requested', translate)).toBe(
      'translated:auditLog.actions.userPasswordResetRequested',
    );
    expect(resolveAdminAuditActionLabel('admin.portfolio.suspended', translate)).toBe(
      'translated:auditLog.actions.portfolioSuspended',
    );
    expect(resolveAdminAuditActionLabel('admin.portfolio.activated', translate)).toBe(
      'translated:auditLog.actions.portfolioActivated',
    );
    expect(resolveAdminAuditActionLabel('admin.portfolio.deleted', translate)).toBe(
      'translated:auditLog.actions.portfolioDeleted',
    );
  });

  it('falls back to the raw code for an action recorded after this map was written', () => {
    expect(resolveAdminAuditActionLabel('admin.rbac.permissions_updated', translate)).toBe(
      'admin.rbac.permissions_updated',
    );
  });
});
