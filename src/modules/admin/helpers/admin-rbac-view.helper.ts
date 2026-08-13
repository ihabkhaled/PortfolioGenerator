import type { TranslateFunction } from '@/packages/i18n';

import { ADMIN_RBAC_PERMISSIONS_ORDER } from '../constants/admin-rbac.constants';
import type {
  AdminPermissionCheckboxRowView,
  AdminRbacPickerRowView,
} from '../types/admin-rbac-view.types';
import type { AdminRbacSearchResult } from '../types/admin-rbac.types';
import type { AdminUsersPaginationProps } from '../types/admin-users-view.types';
import type { AdminPermission, AuthenticatedAdmin } from '../types/admin.types';

import { buildAdminRbacListPath } from './admin-rbac-path.helper';

export function buildAdminRbacPickerRowView(
  admin: AuthenticatedAdmin,
  query: string,
  page: number,
  selectedAdminId: string | null,
  translate: TranslateFunction,
): AdminRbacPickerRowView {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    roleLabel: translate(`roles.${admin.role}`),
    permissionCountLabel: translate('rbac.picker.permissionCount', {
      count: admin.permissions.length,
    }),
    isSelected: admin.id === selectedAdminId,
    editHref: buildAdminRbacListPath(query, page, admin.id),
    editLabel: translate('rbac.picker.edit'),
    selectedLabel: translate('rbac.picker.editing'),
  };
}

export function buildAdminRbacPickerRowViews(
  admins: readonly AuthenticatedAdmin[],
  query: string,
  page: number,
  selectedAdminId: string | null,
  translate: TranslateFunction,
): readonly AdminRbacPickerRowView[] {
  return admins.map((admin) =>
    buildAdminRbacPickerRowView(admin, query, page, selectedAdminId, translate),
  );
}

export function buildAdminRbacResultCountLabel(
  result: Pick<AdminRbacSearchResult, 'skip' | 'pageSize' | 'totalCount'>,
  translate: TranslateFunction,
): string {
  if (result.totalCount === 0) {
    return translate('rbac.picker.resultCountEmpty');
  }

  const from = result.skip + 1;
  const to = Math.min(result.skip + result.pageSize, result.totalCount);

  return translate('rbac.picker.resultCount', { from, to, total: result.totalCount });
}

/** Preserves the currently selected admin across a page change, so paging the picker never closes the editor underneath it. */
export function buildAdminRbacPaginationView(
  result: Pick<AdminRbacSearchResult, 'page' | 'totalPages' | 'hasPrevious' | 'hasNext'>,
  query: string,
  selectedAdminId: string | null,
  translate: TranslateFunction,
): AdminUsersPaginationProps {
  return {
    statusLabel: translate('rbac.picker.pageStatus', {
      page: result.page,
      totalPages: result.totalPages,
    }),
    prevHref: result.hasPrevious
      ? buildAdminRbacListPath(query, result.page - 1, selectedAdminId)
      : null,
    nextHref: result.hasNext
      ? buildAdminRbacListPath(query, result.page + 1, selectedAdminId)
      : null,
    prevLabel: translate('rbac.picker.previousPage'),
    nextLabel: translate('rbac.picker.nextPage'),
  };
}

/**
 * The per-admin editor's checkbox rows: every `AdminPermission`, in the
 * fixed reference order, carrying whether the target currently holds it and
 * whether this checkbox is the self-lockout-proof one. `translate` is passed
 * in rather than resolved here so this same function runs from the server
 * page (initial render) and the client container (re-render after a save),
 * exactly like `buildAdminUserRowView` does for the users list.
 */
export function buildAdminPermissionCheckboxRows(
  currentPermissions: readonly AdminPermission[],
  callerId: string,
  targetId: string,
  translate: TranslateFunction,
): readonly AdminPermissionCheckboxRowView[] {
  const currentSet = new Set(currentPermissions);
  const isEditingSelf = callerId === targetId;

  return ADMIN_RBAC_PERMISSIONS_ORDER.map((permission) => ({
    permission,
    label: translate(`rbac.permissions.${permission}.label`),
    description: translate(`rbac.permissions.${permission}.description`),
    checked: currentSet.has(permission),
    locked: isEditingSelf && permission === 'RBAC_MANAGE',
  }));
}
