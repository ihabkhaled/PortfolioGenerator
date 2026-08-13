import {
  ADMIN_ADMIN_STATUS_BADGE_TONE,
  ADMIN_CREATABLE_ROLES,
} from '../constants/admin-admins.constants';
import type { AdminAdminRoleOption, AdminAdminRowView } from '../types/admin-admins-view.types';
import type { AdminAdminSearchResult, AdminManagedAdmin } from '../types/admin-admins.types';
import type { AdminUsersPaginationProps } from '../types/admin-users-view.types';

import { buildAdminAdminsListPath } from './admin-admins-path.helper';
import { formatAdminDate } from './admin-users-view.helper';

/**
 * One admin, resolved for display. `callerId` decides `isSelf`, which the
 * page uses to withhold the suspend/delete controls from the signed-in
 * admin's own row — the UI mirror of the `assertNotSelfTarget` guard the
 * actions enforce regardless of what this renders.
 */
export function buildAdminAdminRowView(
  admin: AdminManagedAdmin,
  callerId: string,
  translate: (key: string, values?: Record<string, string | number>) => string,
): AdminAdminRowView {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    roleLabel: translate(`roles.${admin.role}`),
    status: admin.status,
    statusBadge: {
      label: translate(`admins.status.${admin.status}`),
      tone: ADMIN_ADMIN_STATUS_BADGE_TONE[admin.status],
    },
    twoFactorLabel: translate(
      admin.twoFactorEnabled ? 'admins.list.twoFactor.yes' : 'admins.list.twoFactor.no',
    ),
    joinedLabel: formatAdminDate(admin.createdAt),
    isSuperAdmin: admin.isSuperAdmin,
    isSelf: admin.id === callerId,
  };
}

export function buildAdminAdminRowViews(
  admins: readonly AdminManagedAdmin[],
  callerId: string,
  translate: (key: string, values?: Record<string, string | number>) => string,
): readonly AdminAdminRowView[] {
  return admins.map((admin) => buildAdminAdminRowView(admin, callerId, translate));
}

export function buildAdminAdminsResultCountLabel(
  result: Pick<AdminAdminSearchResult, 'skip' | 'pageSize' | 'totalCount'>,
  translate: (key: string, values?: Record<string, string | number>) => string,
): string {
  if (result.totalCount === 0) {
    return translate('admins.list.resultCountEmpty');
  }

  const from = result.skip + 1;
  const to = Math.min(result.skip + result.pageSize, result.totalCount);

  return translate('admins.list.resultCount', { from, to, total: result.totalCount });
}

export function buildAdminAdminsPaginationView(
  result: Pick<AdminAdminSearchResult, 'page' | 'totalPages' | 'hasPrevious' | 'hasNext'>,
  query: string,
  translate: (key: string, values?: Record<string, string | number>) => string,
): AdminUsersPaginationProps {
  return {
    statusLabel: translate('admins.list.pageStatus', {
      page: result.page,
      totalPages: result.totalPages,
    }),
    prevHref: result.hasPrevious ? buildAdminAdminsListPath(query, result.page - 1) : null,
    nextHref: result.hasNext ? buildAdminAdminsListPath(query, result.page + 1) : null,
    prevLabel: translate('admins.list.previousPage'),
    nextLabel: translate('admins.list.nextPage'),
  };
}

/** The role `<select>`'s options, translated — `ADMIN_CREATABLE_ROLES` never includes `SUPER_ADMIN`. */
export function buildAdminAdminRoleOptions(
  translate: (key: string, values?: Record<string, string | number>) => string,
): readonly AdminAdminRoleOption[] {
  return ADMIN_CREATABLE_ROLES.map((role) => ({ value: role, label: translate(`roles.${role}`) }));
}
