import 'server-only';

/** Server-only surface for the admin module. */

export {
  getOptionalAdmin,
  getOptionalAdminSession,
  requireAdmin,
} from './services/admin-session.service';
export {
  getAdminAuditSink,
  recordAdminAuditEvent,
  setAdminAuditSink,
} from './services/admin-audit.service';
export { hasAdminPermission, assertNotSuperAdmin } from './policies/admin-authorization.policy';
export { DEFAULT_ROLE_PERMISSIONS } from './constants/admin-permission.constants';
export type {
  AuthenticatedAdmin,
  AdminAuditEventInput,
  AdminAuditSink,
  AdminAuditTargetType,
  AdminAuditMetadata,
  AdminUserRow,
} from './types/admin.types';
