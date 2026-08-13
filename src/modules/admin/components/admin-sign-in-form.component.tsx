import type { ReactElement } from 'react';

import { Button, Input, Label } from '@/packages/ui-primitives';

import { adminAuthClasses } from '../constants/admin-auth-style.constants';
import type { AdminSignInFormProps } from '../types/admin-auth-view.types';

export function AdminSignInForm(props: Readonly<AdminSignInFormProps>): ReactElement {
  return (
    <div className={adminAuthClasses.page}>
      <div className={adminAuthClasses.header}>
        <h1 className={adminAuthClasses.title}>{props.labels.title}</h1>
        <p className={adminAuthClasses.lead}>{props.labels.lead}</p>
      </div>
      <form action={props.action} className={adminAuthClasses.form}>
        {props.errorMessage === null ? null : (
          <p className={adminAuthClasses.error} role="alert">
            {props.errorMessage}
          </p>
        )}
        {props.state.status === 'needs-two-factor' ? (
          <div className={adminAuthClasses.field}>
            <Label htmlFor="admin-two-factor-code">{props.labels.codeLabel}</Label>
            <Input
              id="admin-two-factor-code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
            />
          </div>
        ) : (
          <>
            <div className={adminAuthClasses.field}>
              <Label htmlFor="admin-sign-in-email">{props.labels.emailLabel}</Label>
              <Input
                id="admin-sign-in-email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className={adminAuthClasses.field}>
              <Label htmlFor="admin-sign-in-password">{props.labels.passwordLabel}</Label>
              <Input
                id="admin-sign-in-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
          </>
        )}
        <Button type="submit" disabled={props.isPending}>
          {props.isPending ? props.labels.pendingLabel : props.labels.submitLabel}
        </Button>
      </form>
    </div>
  );
}
