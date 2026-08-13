import type { TranslateFunction } from '@/packages/i18n';

import { DEFAULT_ROLE_PERMISSIONS } from '../constants/admin-permission.constants';
import {
  ADMIN_RBAC_PERMISSIONS_ORDER,
  ADMIN_RBAC_ROLES_ORDER,
} from '../constants/admin-rbac.constants';
import type {
  AdminPermissionMatrixColumn,
  AdminPermissionMatrixRow,
} from '../types/admin-rbac-view.types';
import type { AdminBadgeTone } from '../types/admin-users-view.types';

/** The reference matrix's column headers: every `AdminRole`, in its fixed display order, with its translated label. */
export function buildAdminPermissionMatrixColumns(
  translate: TranslateFunction,
): readonly AdminPermissionMatrixColumn[] {
  return ADMIN_RBAC_ROLES_ORDER.map((role) => ({ role, label: translate(`roles.${role}`) }));
}

/**
 * The reference matrix's rows: every `AdminPermission`, each carrying whether
 * `DEFAULT_ROLE_PERMISSIONS` grants it to every role, in the same order
 * `buildAdminPermissionMatrixColumns` renders them. Purely code-defined
 * policy — this never reflects what the per-admin editor below it has saved
 * for any real admin.
 */
export function buildAdminPermissionMatrixRows(
  translate: TranslateFunction,
): readonly AdminPermissionMatrixRow[] {
  return ADMIN_RBAC_PERMISSIONS_ORDER.map((permission) => ({
    permission,
    label: translate(`rbac.permissions.${permission}.label`),
    description: translate(`rbac.permissions.${permission}.description`),
    grants: ADMIN_RBAC_ROLES_ORDER.map((role) => {
      const granted = DEFAULT_ROLE_PERMISSIONS[role].includes(permission);
      const tone: AdminBadgeTone = granted ? 'success' : 'neutral';

      return {
        role,
        label: translate(granted ? 'rbac.matrix.granted' : 'rbac.matrix.notGranted'),
        tone,
      };
    }),
  }));
}
