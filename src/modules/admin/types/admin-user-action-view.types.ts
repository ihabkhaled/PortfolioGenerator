import type { AdminUserStatus } from './admin.types';

/**
 * What a users-management server action hands back to its form. `message` is
 * a message key (translated by the container), never a raw string — matching
 * `AccountActionState`/`AdminAccountActionState` — but this state carries a
 * message on success too: an admin acting on someone else's account needs
 * positive confirmation, not just the absence of an error.
 */
export interface AdminUserActionState {
  readonly status: 'idle' | 'success' | 'error';
  readonly message: string | null;
}

export interface AdminUserStatusActionProps {
  readonly userId: string;
  readonly currentStatus: AdminUserStatus;
}

export interface AdminResetPasswordActionProps {
  readonly userId: string;
}
