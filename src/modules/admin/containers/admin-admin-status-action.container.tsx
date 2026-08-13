'use client';
// client-boundary-reason: suspending is destructive and needs a local
// arm/confirm step; both directions report their own pending state and the
// server action's outcome inline, without a full page reload.

import { useActionState, useState } from 'react';
import type { ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { Button } from '@/packages/ui-primitives';

import { setAdminAdminStatusAction } from '../actions/admin-admins.actions';
import { adminAdminsClasses } from '../constants/admin-admins-style.constants';
import {
  ADMIN_ADMIN_ACTION_INITIAL_STATE,
  ADMIN_ADMIN_FIELD_NAMES,
} from '../constants/admin-admins.constants';
import type { AdminAdminStatusActionProps } from '../types/admin-admins-view.types';

/**
 * Suspend / activate, one control — mirrors `AdminUserStatusActionContainer`.
 * The page never renders this for the super admin's row or the caller's own
 * row (see `AdminAdminRowView.isSuperAdmin`/`isSelf`); `setAdminAdminStatusAction`
 * enforces both invariants server-side regardless, so this container's job is
 * only ever the UX for an admin that CAN legally be suspended.
 */
export function AdminAdminStatusActionContainer(
  props: Readonly<AdminAdminStatusActionProps>,
): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.admin);
  const [isConfirming, setIsConfirming] = useState(false);
  const [state, formAction, isPending] = useActionState(
    setAdminAdminStatusAction,
    ADMIN_ADMIN_ACTION_INITIAL_STATE,
  );

  const targetStatus = props.currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
  const isSuspendDirection = targetStatus === 'SUSPENDED';
  const actionLabel = t(isSuspendDirection ? 'admins.actions.suspend' : 'admins.actions.activate');

  const outcome =
    state.status === 'idle' || state.message === null ? null : (
      <p
        className={
          state.status === 'error'
            ? adminAdminsClasses.actionOutcomeError
            : adminAdminsClasses.actionOutcome
        }
        role={state.status === 'error' ? 'alert' : 'status'}
      >
        {t(state.message)}
      </p>
    );

  if (isSuspendDirection && !isConfirming) {
    return (
      <div className={adminAdminsClasses.actionRow}>
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
    <form action={formAction} className={adminAdminsClasses.actionRow}>
      <input type="hidden" name={ADMIN_ADMIN_FIELD_NAMES.adminId} value={props.adminId} />
      <input type="hidden" name={ADMIN_ADMIN_FIELD_NAMES.status} value={targetStatus} />
      {isSuspendDirection ? (
        <span className={adminAdminsClasses.actionConfirmText}>
          {t('admins.actions.confirmSuspend')}
        </span>
      ) : null}
      <Button
        type="submit"
        variant={isSuspendDirection ? 'danger' : 'secondary'}
        size="sm"
        disabled={isPending}
      >
        {isPending ? t('admins.actions.pending') : actionLabel}
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
          {t('admins.actions.cancel')}
        </Button>
      ) : null}
      {outcome}
    </form>
  );
}
