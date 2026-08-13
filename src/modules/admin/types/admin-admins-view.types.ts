import type { ReactNode } from 'react';

import type { CreatableAdminRole } from './admin-admins.types';
import type { AdminStatusBadgeView } from './admin-users-view.types';
import type { AdminUserStatus } from './admin.types';

/**
 * What an admins-management server action hands back to its form. `message`
 * is an i18n message key, never a raw string, and carries one on success too
 * — mirroring `AdminUserActionState`: an admin acting on another admin's
 * account needs positive confirmation, not just the absence of an error.
 */
export interface AdminAdminActionState {
  readonly status: 'idle' | 'success' | 'error';
  readonly message: string | null;
}

/** One row of the admins list, fully resolved for display. */
export interface AdminAdminRowView {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly roleLabel: string;
  /** The raw status alongside its badge — the page needs this to tell the row's status-toggle container which direction to offer. */
  readonly status: AdminUserStatus;
  readonly statusBadge: AdminStatusBadgeView;
  readonly twoFactorLabel: string;
  readonly joinedLabel: string;
  /** The seeded, non-touchable account — the page renders no mutation controls for this row. */
  readonly isSuperAdmin: boolean;
  /** The signed-in admin's own row — the page renders no suspend/delete controls here either, the self-lockout guard's UI mirror. */
  readonly isSelf: boolean;
}

/** A row plus its action controls — `null` for the super admin and the caller's own row, where no mutation is ever offered. */
export interface AdminAdminListItemView extends AdminAdminRowView {
  readonly actions: ReactNode;
}

export interface AdminAdminsTableColumnLabels {
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly status: string;
  readonly twoFactor: string;
  readonly joined: string;
  readonly actions: string;
}

export interface AdminAdminsTableProps {
  readonly items: readonly AdminAdminListItemView[];
  readonly columnLabels: AdminAdminsTableColumnLabels;
  /** Shown next to the super admin's name, in place of any action control. */
  readonly protectedLabel: string;
  /** Shown next to the signed-in admin's own row. */
  readonly selfLabel: string;
}

export interface AdminAdminStatusActionProps {
  readonly adminId: string;
  readonly currentStatus: AdminUserStatus;
}

export interface AdminAdminDeleteProps {
  readonly adminId: string;
}

export interface AdminAdminRoleOption {
  readonly value: CreatableAdminRole;
  readonly label: string;
}

export interface AdminAdminCreateFormLabels {
  readonly title: string;
  readonly lead: string;
  readonly nameLabel: string;
  readonly emailLabel: string;
  readonly roleLabel: string;
  readonly passwordLabel: string;
  readonly showPassword: string;
  readonly hidePassword: string;
  readonly submitLabel: string;
  readonly pendingLabel: string;
}

export interface AdminAdminCreateFormProps {
  readonly action: (formData: FormData) => void;
  readonly isPending: boolean;
  readonly errorMessage: string | null;
  readonly successMessage: string | null;
  readonly roleOptions: readonly AdminAdminRoleOption[];
  readonly labels: AdminAdminCreateFormLabels;
}
