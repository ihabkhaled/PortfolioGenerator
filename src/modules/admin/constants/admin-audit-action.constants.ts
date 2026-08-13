/**
 * Every admin-audit `action` code this codebase actually records, mapped to
 * its i18n message key — see every `recordAdminAuditEvent({ action: ... })`
 * call site under `src/modules/admin/actions/`.
 *
 * Deliberately not exhaustive by construction: `resolveAdminAuditActionLabel`
 * falls back to the raw code for anything missing here, so a new action
 * shipped without a matching entry still renders — as its code, not as a
 * blank or a hidden row — rather than throwing or disappearing.
 */
export const ADMIN_AUDIT_ACTION_MESSAGE_KEYS: Readonly<Record<string, string>> = {
  'admin.session.created': 'auditLog.actions.sessionCreated',
  'admin.session.signed_out': 'auditLog.actions.sessionSignedOut',
  'admin.two_factor.enrolled': 'auditLog.actions.twoFactorEnrolled',
  'admin.two_factor.verified': 'auditLog.actions.twoFactorVerified',
  'admin.password.changed': 'auditLog.actions.passwordChanged',
  'admin.user.suspended': 'auditLog.actions.userSuspended',
  'admin.user.activated': 'auditLog.actions.userActivated',
  'admin.user.password_reset_requested': 'auditLog.actions.userPasswordResetRequested',
  'admin.portfolio.suspended': 'auditLog.actions.portfolioSuspended',
  'admin.portfolio.activated': 'auditLog.actions.portfolioActivated',
  'admin.portfolio.deleted': 'auditLog.actions.portfolioDeleted',
};
