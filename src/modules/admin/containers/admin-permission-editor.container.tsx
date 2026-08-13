'use client';
// client-boundary-reason: useActionState drives the save's pending flag, and
// overwriting an admin's whole permission set is destructive enough to need
// a local arm/confirm step, mirroring DeletePortfolioContainer.

import { useActionState, useState } from 'react';
import type { ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';

import { saveAdminUserPermissionsAction } from '../actions/admin-rbac.actions';
import { AdminPermissionEditor } from '../components/admin-permission-editor.component';
import { adminRbacClasses } from '../constants/admin-rbac-style.constants';
import {
  ADMIN_RBAC_FIELD_NAMES,
  ADMIN_RBAC_INITIAL_STATE,
} from '../constants/admin-rbac.constants';
import { buildAdminPermissionCheckboxRows } from '../helpers/admin-rbac-view.helper';
import type { AdminPermissionEditorContainerProps } from '../types/admin-rbac-action-view.types';

export function AdminPermissionEditorContainer(
  props: Readonly<AdminPermissionEditorContainerProps>,
): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.admin);
  const [isConfirming, setIsConfirming] = useState(false);
  const [state, formAction, isPending] = useActionState(
    saveAdminUserPermissionsAction,
    ADMIN_RBAC_INITIAL_STATE,
  );

  const rows = buildAdminPermissionCheckboxRows(
    props.currentPermissions,
    props.callerId,
    props.targetId,
    t,
  );

  const outcome =
    state.status === 'idle' || state.message === null ? null : (
      <p
        className={
          state.status === 'error' ? adminRbacClasses.outcomeError : adminRbacClasses.outcome
        }
        role={state.status === 'error' ? 'alert' : 'status'}
      >
        {t(state.message)}
      </p>
    );

  return (
    <AdminPermissionEditor
      action={formAction}
      adminIdFieldName={ADMIN_RBAC_FIELD_NAMES.adminId}
      permissionsFieldName={ADMIN_RBAC_FIELD_NAMES.permissions}
      targetId={props.targetId}
      targetName={props.targetName}
      targetEmail={props.targetEmail}
      targetRoleLabel={props.targetRoleLabel}
      changeAdminHref={props.changeAdminHref}
      rows={rows}
      labels={{
        heading: t('rbac.editor.heading'),
        description: t('rbac.editor.description'),
        targetLabel: t('rbac.editor.targetLabel'),
        roleLabel: t('rbac.editor.roleLabel'),
        lockedHint: t('rbac.editor.lockedHint'),
        changeAdminLabel: t('rbac.editor.changeAdmin'),
        saveLabel: t('rbac.editor.save'),
        confirmMessage: t('rbac.editor.confirmMessage'),
        confirmLabel: t('rbac.editor.confirm'),
        cancelLabel: t('rbac.editor.cancel'),
        pendingLabel: t('rbac.editor.pending'),
      }}
      isConfirming={isConfirming}
      isPending={isPending}
      onArm={() => {
        setIsConfirming(true);
      }}
      onCancel={() => {
        setIsConfirming(false);
      }}
      outcome={outcome}
    />
  );
}
