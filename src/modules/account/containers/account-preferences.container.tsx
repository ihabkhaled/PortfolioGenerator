'use client';
// client-boundary-reason: useActionState exposes save progress and the persisted result.

import { useActionState } from 'react';
import type { ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { Button, Label, Select } from '@/packages/ui-primitives';

import { updateAccountPreferencesAction } from '../actions/account.actions';
import { accountClasses } from '../constants/account-style.constants';
import {
  ACCOUNT_SETTINGS_FIELD_NAMES,
  ACCOUNT_SETTINGS_INITIAL_STATE,
} from '../constants/settings.constants';
import type { AccountPreferencesFormProps } from '../types/account-view.types';

export function AccountPreferencesContainer(
  props: Readonly<AccountPreferencesFormProps>,
): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.account);
  const [state, action, isPending] = useActionState(
    updateAccountPreferencesAction,
    ACCOUNT_SETTINGS_INITIAL_STATE,
  );
  return (
    <form action={action} className={accountClasses.section}>
      <h2 className={accountClasses.sectionTitle}>{t('preferences.title')}</h2>
      <p className={accountClasses.sectionHint}>{t('preferences.hint')}</p>
      <div className={accountClasses.field}>
        <Label htmlFor={ACCOUNT_SETTINGS_FIELD_NAMES.locale}>{props.labels.locale}</Label>
        <Select
          id={ACCOUNT_SETTINGS_FIELD_NAMES.locale}
          name={ACCOUNT_SETTINGS_FIELD_NAMES.locale}
          defaultValue={props.preferences.locale}
        >
          {props.localeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <div className={accountClasses.field}>
        <Label htmlFor={ACCOUNT_SETTINGS_FIELD_NAMES.themePreference}>{props.labels.theme}</Label>
        <Select
          id={ACCOUNT_SETTINGS_FIELD_NAMES.themePreference}
          name={ACCOUNT_SETTINGS_FIELD_NAMES.themePreference}
          defaultValue={props.preferences.themePreference}
        >
          {props.themeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <div className={accountClasses.field}>
        <Label htmlFor={ACCOUNT_SETTINGS_FIELD_NAMES.defaultCountryIso}>
          {props.labels.country}
        </Label>
        <Select
          id={ACCOUNT_SETTINGS_FIELD_NAMES.defaultCountryIso}
          name={ACCOUNT_SETTINGS_FIELD_NAMES.defaultCountryIso}
          defaultValue={props.preferences.defaultCountryIso ?? ''}
        >
          <option value="">{props.labels.noCountry}</option>
          {props.countryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      {state.status === 'success' ? (
        <p className={accountClasses.sectionHint} role="status">
          {props.labels.saved}
        </p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? props.labels.pending : props.labels.submit}
      </Button>
    </form>
  );
}
