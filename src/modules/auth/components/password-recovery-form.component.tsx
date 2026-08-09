import type { ReactElement } from 'react';

import { AUTH_MIN_PASSWORD_LENGTH } from '@/packages/auth';
import { ErrorIcon } from '@/packages/icons';
import { Button, Input, Label } from '@/packages/ui-primitives';

import { authClasses } from '../constants/auth-style.constants';
import { AUTH_FIELD_NAMES } from '../constants/auth.constants';
import type { PasswordRecoveryFormProps } from '../types/password-recovery-form.types';

export function PasswordRecoveryForm(props: Readonly<PasswordRecoveryFormProps>): ReactElement {
  return (
    <form action={props.action} className={authClasses.form} noValidate>
      {props.errorMessage === null ? null : (
        <p className={authClasses.error} role="alert">
          <ErrorIcon aria-hidden size={18} />
          <span className={authClasses.errorText}>{props.errorMessage}</span>
        </p>
      )}
      {props.successMessage === null ? null : (
        <p className={authClasses.hint} role="status">
          {props.successMessage}
        </p>
      )}
      {props.mode === 'request' ? (
        <div className={authClasses.field}>
          <Label htmlFor={AUTH_FIELD_NAMES.email}>{props.emailLabel}</Label>
          <Input
            id={AUTH_FIELD_NAMES.email}
            name={AUTH_FIELD_NAMES.email}
            type="email"
            autoComplete="email"
            required
            maxLength={320}
          />
        </div>
      ) : (
        <>
          <input type="hidden" name={AUTH_FIELD_NAMES.resetToken} value={props.token ?? ''} />
          <div className={authClasses.field}>
            <Label htmlFor={AUTH_FIELD_NAMES.newPassword}>{props.passwordLabel}</Label>
            <Input
              id={AUTH_FIELD_NAMES.newPassword}
              name={AUTH_FIELD_NAMES.newPassword}
              type="password"
              autoComplete="new-password"
              required
              minLength={AUTH_MIN_PASSWORD_LENGTH}
              aria-describedby={`${AUTH_FIELD_NAMES.newPassword}-hint`}
            />
            <p id={`${AUTH_FIELD_NAMES.newPassword}-hint`} className={authClasses.hint}>
              {props.passwordHint}
            </p>
          </div>
        </>
      )}
      <Button type="submit" className={authClasses.submit} disabled={props.isPending}>
        {props.isPending ? props.pendingLabel : props.submitLabel}
      </Button>
    </form>
  );
}
