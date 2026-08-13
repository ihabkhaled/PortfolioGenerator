import type { ReactElement } from 'react';

import { AppImage } from '@/packages/image';
import { Button, Input, Label } from '@/packages/ui-primitives';

import { adminAuthClasses } from '../constants/admin-auth-style.constants';
import type { AdminTwoFactorEnrollProps } from '../types/admin-auth-view.types';

export function AdminTwoFactorEnroll(props: Readonly<AdminTwoFactorEnrollProps>): ReactElement {
  return (
    <div className={adminAuthClasses.page}>
      <div className={adminAuthClasses.header}>
        <h1 className={adminAuthClasses.title}>{props.labels.enrollTitle}</h1>
        <p className={adminAuthClasses.lead}>{props.labels.enrollLead}</p>
      </div>
      <div className={adminAuthClasses.qrFrame}>
        <AppImage
          className={adminAuthClasses.qrImage}
          src={props.enrollment.qrCodeDataUrl}
          alt={props.labels.qrAlt}
          width={192}
          height={192}
        />
        <p className={adminAuthClasses.secret}>{props.enrollment.totpUri}</p>
        <div className={adminAuthClasses.backupCodes}>
          {props.enrollment.backupCodes.map((code) => (
            <span key={code}>{code}</span>
          ))}
        </div>
      </div>
      <form action={props.action} className={adminAuthClasses.form}>
        {props.errorMessage === null ? null : (
          <p className={adminAuthClasses.error} role="alert">
            {props.errorMessage}
          </p>
        )}
        <div className={adminAuthClasses.field}>
          <Label htmlFor="admin-enroll-code">{props.labels.confirmCodeLabel}</Label>
          <Input
            id="admin-enroll-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
          />
        </div>
        <Button type="submit" disabled={props.isPending}>
          {props.isPending ? props.labels.pendingLabel : props.labels.submitLabel}
        </Button>
      </form>
    </div>
  );
}
