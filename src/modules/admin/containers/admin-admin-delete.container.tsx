'use client';
// client-boundary-reason: a destructive delete with its own pending state, and
// an inline confirm step whose visibility is local UI state.

import { useActionState, useState } from 'react';
import type { ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { Button } from '@/packages/ui-primitives';

import { deleteAdminAdminAction } from '../actions/admin-admins.actions';
import { adminAdminsClasses } from '../constants/admin-admins-style.constants';
import {
  ADMIN_ADMIN_ACTION_INITIAL_STATE,
  ADMIN_ADMIN_FIELD_NAMES,
} from '../constants/admin-admins.constants';
import type { AdminAdminDeleteProps } from '../types/admin-admins-view.types';

/**
 * Two steps, in-row — mirrors `AdminPortfolioDeleteContainer`. The page never
 * renders this for the super admin's row or the caller's own row;
 * `deleteAdminAdminAction` enforces both invariants server-side regardless.
 */
export function AdminAdminDeleteContainer(props: Readonly<AdminAdminDeleteProps>): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.admin);
  const [isConfirming, setIsConfirming] = useState(false);
  const [state, formAction, isPending] = useActionState(
    deleteAdminAdminAction,
    ADMIN_ADMIN_ACTION_INITIAL_STATE,
  );

  if (!isConfirming) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          setIsConfirming(true);
        }}
      >
        {t('admins.actions.delete')}
      </Button>
    );
  }

  return (
    <form action={formAction} className={adminAdminsClasses.actionRow}>
      <input type="hidden" name={ADMIN_ADMIN_FIELD_NAMES.adminId} value={props.adminId} />
      <span className={adminAdminsClasses.actionConfirmText}>
        {t('admins.actions.deleteConfirmHint')}
      </span>
      <Button type="submit" variant="danger" size="sm" disabled={isPending}>
        {t(isPending ? 'admins.actions.deleting' : 'admins.actions.deleteConfirm')}
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => {
          setIsConfirming(false);
        }}
      >
        {t('admins.actions.deleteCancel')}
      </Button>
      {state.status === 'error' && state.message !== null ? (
        <p className={adminAdminsClasses.actionOutcomeError} role="alert">
          {t(state.message)}
        </p>
      ) : null}
    </form>
  );
}
