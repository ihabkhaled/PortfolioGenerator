import type { ReactNode } from 'react';

import type { AdminBadgeTone } from './admin-users-view.types';
import type { AdminPermission, AdminRole } from './admin.types';

/** One role column header in the reference matrix. */
export interface AdminPermissionMatrixColumn {
  readonly role: AdminRole;
  readonly label: string;
}

/** Whether one role is granted one permission by default, already resolved to a label/tone the `Badge` primitive accepts. */
export interface AdminPermissionMatrixGrant {
  readonly role: AdminRole;
  readonly label: string;
  readonly tone: AdminBadgeTone;
}

/** One permission's row in the reference matrix: its own label/description, plus every role's default grant, in `columns` order. */
export interface AdminPermissionMatrixRow {
  readonly permission: AdminPermission;
  readonly label: string;
  readonly description: string;
  readonly grants: readonly AdminPermissionMatrixGrant[];
}

export interface AdminPermissionMatrixColumnLabels {
  readonly permission: string;
}

export interface AdminPermissionMatrixProps {
  readonly columns: readonly AdminPermissionMatrixColumn[];
  readonly rows: readonly AdminPermissionMatrixRow[];
  readonly columnLabels: AdminPermissionMatrixColumnLabels;
}

/** One row of the admin picker — the searchable, paginated list an RBAC editor target is chosen from. */
export interface AdminRbacPickerRowView {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly roleLabel: string;
  readonly permissionCountLabel: string;
  /** `true` when this row is the admin currently open in the editor below — the row shows a badge instead of a redundant link. */
  readonly isSelected: boolean;
  readonly editHref: string;
  readonly editLabel: string;
  readonly selectedLabel: string;
}

export interface AdminRbacPickerColumnLabels {
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly permissions: string;
  readonly actions: string;
}

export interface AdminRbacPickerTableProps {
  readonly items: readonly AdminRbacPickerRowView[];
  readonly columnLabels: AdminRbacPickerColumnLabels;
}

/** One checkbox in the per-admin permission editor. */
export interface AdminPermissionCheckboxRowView {
  readonly permission: AdminPermission;
  readonly label: string;
  readonly description: string;
  readonly checked: boolean;
  /**
   * `true` only for `RBAC_MANAGE` when the target is the admin currently
   * editing their own account. The checkbox renders disabled and checked,
   * and the form still submits the permission via a parallel hidden field —
   * disabled fields are dropped from `FormData`, so the mirror is what
   * actually makes self-removal unreachable from this screen, not just the
   * disabled attribute. The server action refuses the same case independently.
   */
  readonly locked: boolean;
}

export interface AdminPermissionEditorLabels {
  readonly heading: string;
  readonly description: string;
  readonly targetLabel: string;
  readonly roleLabel: string;
  readonly lockedHint: string;
  readonly changeAdminLabel: string;
  readonly saveLabel: string;
  readonly confirmMessage: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly pendingLabel: string;
}

export interface AdminPermissionEditorProps {
  readonly action: (formData: FormData) => void;
  readonly adminIdFieldName: string;
  readonly permissionsFieldName: string;
  readonly targetId: string;
  readonly targetName: string;
  readonly targetEmail: string;
  readonly targetRoleLabel: string;
  readonly changeAdminHref: string;
  readonly rows: readonly AdminPermissionCheckboxRowView[];
  readonly labels: AdminPermissionEditorLabels;
  readonly isConfirming: boolean;
  readonly isPending: boolean;
  readonly onArm: () => void;
  readonly onCancel: () => void;
  readonly outcome: ReactNode;
}
