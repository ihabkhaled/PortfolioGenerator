'use client';
// client-boundary-reason: useActionState reports the profile update without navigating away.

import { useActionState } from 'react';
import type { ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { Button, Input, Label } from '@/packages/ui-primitives';

import { updateAccountProfileAction } from '../actions/account.actions';
import { accountClasses } from '../constants/account-style.constants';
import {
  ACCOUNT_SETTINGS_FIELD_NAMES,
  ACCOUNT_SETTINGS_INITIAL_STATE,
} from '../constants/settings.constants';
import type { AccountProfileFormProps } from '../types/account-view.types';

export function AccountProfileContainer(props: Readonly<AccountProfileFormProps>): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.account);
  const [state, action, isPending] = useActionState(
    updateAccountProfileAction,
    ACCOUNT_SETTINGS_INITIAL_STATE,
  );

  return (
    <form action={action} className={accountClasses.section}>
      <h2 className={accountClasses.sectionTitle}>{props.labels.title}</h2>
      <p className={accountClasses.sectionHint}>{props.labels.hint}</p>
      <div className={accountClasses.field}>
        <Label htmlFor={ACCOUNT_SETTINGS_FIELD_NAMES.name}>{props.labels.name}</Label>
        <Input
          id={ACCOUNT_SETTINGS_FIELD_NAMES.name}
          name={ACCOUNT_SETTINGS_FIELD_NAMES.name}
          defaultValue={props.name}
          maxLength={120}
          required
        />
      </div>
      {state.status === 'success' ? (
        <p className={accountClasses.sectionHint} role="status">
          {props.labels.saved}
        </p>
      ) : null}
      {state.status === 'error' && state.error !== null ? (
        <p className={accountClasses.error} role="alert">
          {t(state.error)}
        </p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? props.labels.pending : props.labels.submit}
      </Button>
    </form>
  );
}
