import type { ReactElement } from 'react';

import { AppLink, toAppRoute } from '@/packages/link';
import { Button, Input, Label } from '@/packages/ui-primitives';

import { adminRbacClasses } from '../constants/admin-rbac-style.constants';
import type { AdminPermissionEditorProps } from '../types/admin-rbac-view.types';

/**
 * One admin's permission checkboxes, plus the save flow: an armed "Save
 * changes" button that reveals a confirm step before anything is submitted,
 * mirroring `DeletePortfolioContainer` — overwriting an admin's entire
 * permission set can remove access as sweepingly as a delete can remove data.
 *
 * The checkboxes themselves stay mounted across the arm/confirm toggle (they
 * sit outside the conditional branch below), so a half-edited selection is
 * never lost by clicking "Save changes".
 */
export function AdminPermissionEditor(props: Readonly<AdminPermissionEditorProps>): ReactElement {
  return (
    <section className={adminRbacClasses.editorCard}>
      <div className={adminRbacClasses.editorHeader}>
        <div>
          <h2 className={adminRbacClasses.editorHeading}>{props.labels.heading}</h2>
          <p className={adminRbacClasses.editorHint}>{props.labels.description}</p>
        </div>
        <AppLink
          href={toAppRoute(props.changeAdminHref)}
          className={adminRbacClasses.editorChangeLink}
        >
          {props.labels.changeAdminLabel}
        </AppLink>
        <dl className={adminRbacClasses.editorTargetMeta}>
          <div className={adminRbacClasses.editorTargetRow}>
            <dt className={adminRbacClasses.editorTargetTerm}>{props.labels.targetLabel}</dt>
            <dd className={adminRbacClasses.editorTargetValue}>
              {props.targetName} ({props.targetEmail})
            </dd>
          </div>
          <div className={adminRbacClasses.editorTargetRow}>
            <dt className={adminRbacClasses.editorTargetTerm}>{props.labels.roleLabel}</dt>
            <dd className={adminRbacClasses.editorTargetValue}>{props.targetRoleLabel}</dd>
          </div>
        </dl>
      </div>

      <form action={props.action} className={adminRbacClasses.editorForm}>
        <input type="hidden" name={props.adminIdFieldName} value={props.targetId} />
        <div className={adminRbacClasses.checkboxGrid}>
          {props.rows.map((row) => (
            <div key={row.permission} className={adminRbacClasses.checkboxRow}>
              <Label className={adminRbacClasses.checkboxLabel}>
                <Input
                  type="checkbox"
                  name={props.permissionsFieldName}
                  value={row.permission}
                  defaultChecked={row.checked}
                  disabled={row.locked}
                />
                {row.label}
              </Label>
              <p className={adminRbacClasses.checkboxDescription}>{row.description}</p>
              {row.locked ? (
                <>
                  <input type="hidden" name={props.permissionsFieldName} value={row.permission} />
                  <p className={adminRbacClasses.checkboxLockedHint}>{props.labels.lockedHint}</p>
                </>
              ) : null}
            </div>
          ))}
        </div>

        {props.outcome}

        {props.isConfirming ? (
          <div className={adminRbacClasses.editorActions}>
            <p className={adminRbacClasses.editorConfirmText}>{props.labels.confirmMessage}</p>
            <Button type="submit" variant="primary" disabled={props.isPending}>
              {props.isPending ? props.labels.pendingLabel : props.labels.confirmLabel}
            </Button>
            <Button type="button" variant="secondary" onClick={props.onCancel}>
              {props.labels.cancelLabel}
            </Button>
          </div>
        ) : (
          <div className={adminRbacClasses.editorActions}>
            <Button type="button" variant="primary" onClick={props.onArm}>
              {props.labels.saveLabel}
            </Button>
          </div>
        )}
      </form>
    </section>
  );
}
