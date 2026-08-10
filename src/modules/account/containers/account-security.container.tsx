'use client';
// client-boundary-reason: security operations expose independent pending and success states.

import { useActionState } from 'react';
import type { ReactElement } from 'react';

import { Button, Label, PasswordInput } from '@/packages/ui-primitives';

import {
  changeAccountPasswordAction,
  resendEmailVerificationAction,
  revokeAccountSessionAction,
} from '../actions/account.actions';
import { accountClasses } from '../constants/account-style.constants';
import {
  ACCOUNT_SETTINGS_FIELD_NAMES,
  ACCOUNT_SETTINGS_INITIAL_STATE,
} from '../constants/settings.constants';
import type { AccountSecurityProps, AccountSessionRowProps } from '../types/account-view.types';

export function AccountSecurityContainer(props: Readonly<AccountSecurityProps>): ReactElement {
  const [verificationState, resendVerification, verificationPending] = useActionState(
    resendEmailVerificationAction,
    ACCOUNT_SETTINGS_INITIAL_STATE,
  );
  const [passwordState, changePassword, passwordPending] = useActionState(
    changeAccountPasswordAction,
    ACCOUNT_SETTINGS_INITIAL_STATE,
  );

  return (
    <section className={accountClasses.section}>
      <h2 className={accountClasses.sectionTitle}>{props.labels.title}</h2>
      <p className={accountClasses.sectionHint}>{props.labels.hint}</p>

      <div className={accountClasses.field}>
        <h3 className={accountClasses.sectionTitle}>{props.labels.verificationTitle}</h3>
        <p className={accountClasses.sectionHint}>
          {props.email} — {props.emailVerified ? props.labels.verified : props.labels.unverified}
        </p>
        {props.emailVerified ? null : (
          <form action={resendVerification}>
            <Button type="submit" disabled={verificationPending}>
              {verificationPending ? props.labels.sending : props.labels.resend}
            </Button>
          </form>
        )}
        {verificationState.status === 'success' ? (
          <p className={accountClasses.sectionHint} role="status">
            {props.labels.sent}
          </p>
        ) : null}
      </div>

      <form action={changePassword} className={accountClasses.field}>
        <h3 className={accountClasses.sectionTitle}>{props.labels.passwordTitle}</h3>
        <Label htmlFor={ACCOUNT_SETTINGS_FIELD_NAMES.currentPassword}>
          {props.labels.currentPassword}
        </Label>
        <PasswordInput
          id={ACCOUNT_SETTINGS_FIELD_NAMES.currentPassword}
          name={ACCOUNT_SETTINGS_FIELD_NAMES.currentPassword}
          autoComplete="current-password"
          required
          showLabel={props.labels.showPassword}
          hideLabel={props.labels.hidePassword}
        />
        <Label htmlFor={ACCOUNT_SETTINGS_FIELD_NAMES.newPassword}>{props.labels.newPassword}</Label>
        <PasswordInput
          id={ACCOUNT_SETTINGS_FIELD_NAMES.newPassword}
          name={ACCOUNT_SETTINGS_FIELD_NAMES.newPassword}
          autoComplete="new-password"
          required
          showLabel={props.labels.showPassword}
          hideLabel={props.labels.hidePassword}
        />
        {passwordState.status === 'success' ? (
          <p className={accountClasses.sectionHint} role="status">
            {props.labels.passwordChanged}
          </p>
        ) : null}
        <Button type="submit" disabled={passwordPending}>
          {passwordPending ? props.labels.changingPassword : props.labels.changePassword}
        </Button>
      </form>

      <div className={accountClasses.field}>
        <h3 className={accountClasses.sectionTitle}>{props.labels.sessionsTitle}</h3>
        {props.sessions.length === 0 ? (
          <p className={accountClasses.sectionHint}>{props.labels.noSessions}</p>
        ) : null}
        {props.sessions.map((session) => (
          <SessionRow
            key={session.token}
            session={session}
            current={session.current}
            labels={props.labels}
          />
        ))}
      </div>
    </section>
  );
}

function SessionRow({ session, current, labels }: Readonly<AccountSessionRowProps>): ReactElement {
  const [, revoke, pending] = useActionState(
    revokeAccountSessionAction,
    ACCOUNT_SETTINGS_INITIAL_STATE,
  );
  return (
    <form action={revoke} className={accountClasses.definitionRow}>
      <input type="hidden" name={ACCOUNT_SETTINGS_FIELD_NAMES.sessionToken} value={session.token} />
      <span className={accountClasses.definitionValue}>
        {session.userAgent ?? labels.unknownDevice}
        {current ? ` — ${labels.currentSession}` : ''}
      </span>
      <span className={accountClasses.sectionHint}>
        {session.ipAddress ?? labels.unknownAddress}
      </span>
      <span className={accountClasses.sectionHint}>
        {labels.created}: {session.createdAt.toISOString()}
      </span>
      <span className={accountClasses.sectionHint}>
        {labels.expires}: {session.expiresAt.toISOString()}
      </span>
      {current ? null : (
        <Button type="submit" disabled={pending}>
          {pending ? labels.revoking : labels.revoke}
        </Button>
      )}
    </form>
  );
}
