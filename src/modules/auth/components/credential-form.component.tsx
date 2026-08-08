import type { ReactElement } from 'react';

import { AUTH_MIN_PASSWORD_LENGTH } from '@/packages/auth';
import { ErrorIcon } from '@/packages/icons';
import { Button, Input, Label } from '@/packages/ui-primitives';

import { authClasses } from '../constants/auth-style.constants';
import { AUTH_FIELD_NAMES } from '../constants/auth.constants';
import type { CredentialFormProps } from '../types/auth-form.types';

/**
 * A plain HTML form posting to a server action. It works without JavaScript,
 * which matters for the one flow a user cannot skip.
 *
 * The error is announced through `role="alert"` and paired with an icon, so it
 * is not communicated by colour alone.
 */
export function CredentialForm(props: Readonly<CredentialFormProps>): ReactElement {
  return (
    <form action={props.action} className={authClasses.form} noValidate>
      {props.errorMessage === null ? null : (
        <p className={authClasses.error} role="alert">
          <ErrorIcon aria-hidden size={18} />
          <span className={authClasses.errorText}>{props.errorMessage}</span>
        </p>
      )}

      {props.includeName ? (
        <div className={authClasses.field}>
          <Label htmlFor={AUTH_FIELD_NAMES.name}>{props.labels.name}</Label>
          <Input
            id={AUTH_FIELD_NAMES.name}
            name={AUTH_FIELD_NAMES.name}
            type="text"
            autoComplete="name"
            required
            maxLength={120}
          />
        </div>
      ) : null}

      <div className={authClasses.field}>
        <Label htmlFor={AUTH_FIELD_NAMES.email}>{props.labels.email}</Label>
        <Input
          id={AUTH_FIELD_NAMES.email}
          name={AUTH_FIELD_NAMES.email}
          type="email"
          autoComplete="email"
          required
          maxLength={320}
        />
      </div>

      <div className={authClasses.field}>
        <Label htmlFor={AUTH_FIELD_NAMES.password}>{props.labels.password}</Label>
        <Input
          id={AUTH_FIELD_NAMES.password}
          name={AUTH_FIELD_NAMES.password}
          type="password"
          autoComplete={props.includeName ? 'new-password' : 'current-password'}
          required
          minLength={AUTH_MIN_PASSWORD_LENGTH}
          aria-describedby={`${AUTH_FIELD_NAMES.password}-hint`}
        />
        <p id={`${AUTH_FIELD_NAMES.password}-hint`} className={authClasses.hint}>
          {props.labels.passwordHint}
        </p>
      </div>

      <Button type="submit" className={authClasses.submit} disabled={props.isPending}>
        {props.isPending ? props.pendingLabel : props.submitLabel}
      </Button>

      {props.footer}
    </form>
  );
}
