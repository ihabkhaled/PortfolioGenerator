import type { AdminPermission } from './admin.types';

/**
 * What the save-permissions action hands back to its form — mirrors
 * `AdminUserActionState`: `message` is a message key the container
 * translates, never raw text, and is populated on success too, since
 * overwriting an admin's entire permission set needs positive confirmation.
 */
export interface AdminRbacActionState {
  readonly status: 'idle' | 'success' | 'error';
  readonly message: string | null;
}

/** What the server page resolves before handing the editor to its client container — everything the container needs but cannot read itself. */
export interface AdminPermissionEditorContainerProps {
  readonly targetId: string;
  readonly targetName: string;
  readonly targetEmail: string;
  readonly targetRoleLabel: string;
  readonly currentPermissions: readonly AdminPermission[];
  readonly callerId: string;
  readonly changeAdminHref: string;
}
