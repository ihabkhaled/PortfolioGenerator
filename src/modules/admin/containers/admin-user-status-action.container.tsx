'use client';
// client-boundary-reason: suspending is destructive and needs a local
// arm/confirm step; both directions report their own pending state and the
// server action's outcome inline, without a full page reload.

import { useActionState, useState } from 'react';
import type { ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { Button } from '@/packages/ui-primitives';

import { setUserAccountStatusAction } from '../actions/admin-users.actions';
import { adminUsersClasses } from '../constants/admin-users-style.constants';
import {
  ADMIN_USER_ACTION_FIELD_NAMES,
  ADMIN_USER_ACTION_INITIAL_STATE,
} from '../constants/admin-users.constants';
import type { AdminUserStatusActionProps } from '../types/admin-user-action-view.types';

/**
 * Suspend / activate, one control. `currentStatus` decides which direction
 * this row offers: suspending is the destructive one and mirrors
 * `DeletePortfolioContainer` — arm, then confirm — activating is a single
 * click, matching how little there is to undo.
 */
export function AdminUserStatusActionContainer(
  props: Readonly<AdminUserStatusActionProps>,
): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.admin);
  const [isConfirming, setIsConfirming] = useState(false);
  const [state, formAction, isPending] = useActionState(
    setUserAccountStatusAction,
    ADMIN_USER_ACTION_INITIAL_STATE,
  );

  const targetStatus = props.currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
  const isSuspendDirection = targetStatus === 'SUSPENDED';
  const actionLabel = t(isSuspendDirection ? 'users.actions.suspend' : 'users.actions.activate');

  const outcome =
    state.status === 'idle' || state.message === null ? null : (
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
    );

  if (isSuspendDirection && !isConfirming) {
    return (
      <div className={adminUsersClasses.actionRow}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsConfirming(true);
          }}
        >
          {actionLabel}
        </Button>
        {outcome}
      </div>
    );
  }

  return (
    <form action={formAction} className={adminUsersClasses.actionRow}>
      <input type="hidden" name={ADMIN_USER_ACTION_FIELD_NAMES.userId} value={props.userId} />
      <input type="hidden" name={ADMIN_USER_ACTION_FIELD_NAMES.status} value={targetStatus} />
      {isSuspendDirection ? (
        <span className={adminUsersClasses.actionConfirmText}>
          {t('users.actions.confirmSuspend')}
        </span>
      ) : null}
      <Button
        type="submit"
        variant={isSuspendDirection ? 'danger' : 'secondary'}
        size="sm"
        disabled={isPending}
      >
        {isPending ? t('users.actions.pending') : actionLabel}
      </Button>
      {isSuspendDirection ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            setIsConfirming(false);
          }}
        >
          {t('users.actions.cancel')}
        </Button>
      ) : null}
      {outcome}
    </form>
  );
}
