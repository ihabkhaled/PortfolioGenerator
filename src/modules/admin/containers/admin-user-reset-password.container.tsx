'use client';
// client-boundary-reason: a single server action whose pending state and
// outcome (sent / failed) render inline in the row.

import { useActionState } from 'react';
import type { ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { Button } from '@/packages/ui-primitives';

import { resetUserPasswordAction } from '../actions/admin-users.actions';
import { adminUsersClasses } from '../constants/admin-users-style.constants';
import {
  ADMIN_USER_ACTION_FIELD_NAMES,
  ADMIN_USER_ACTION_INITIAL_STATE,
} from '../constants/admin-users.constants';
import type { AdminResetPasswordActionProps } from '../types/admin-user-action-view.types';

/**
 * One click, no arm/confirm step: this only ever triggers the same email a
 * self-service "forgot password" request sends, and doing it twice by
 * mistake is a second identical email, not a state change to undo.
 */
export function AdminUserResetPasswordContainer(
  props: Readonly<AdminResetPasswordActionProps>,
): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.admin);
  const [state, formAction, isPending] = useActionState(
    resetUserPasswordAction,
    ADMIN_USER_ACTION_INITIAL_STATE,
  );

  return (
    <form action={formAction} className={adminUsersClasses.actionRow}>
      <input type="hidden" name={ADMIN_USER_ACTION_FIELD_NAMES.userId} value={props.userId} />
      <Button type="submit" variant="ghost" size="sm" disabled={isPending}>
        {t(isPending ? 'users.actions.resetPending' : 'users.actions.resetPassword')}
      </Button>
      {state.status === 'idle' || state.message === null ? null : (
        <p
          className={
            state.status === 'error'
              ? adminUsersClasses.actionOutcomeError
              : adminUsersClasses.actionOutcome
          }
          role={state.status === 'error' ? 'alert' : 'status'}
        >
          {t(state.message)}
        </p>
      )}
    </form>
  );
}
