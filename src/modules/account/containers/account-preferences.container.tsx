'use client';
// client-boundary-reason: useActionState exposes save progress and the persisted result.

import { useActionState, useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { useRouter } from '@/packages/navigation/client';
import { useTheme, type ThemePreference } from '@/packages/theme';
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
  const formRef = useRef<HTMLFormElement>(null);
  const [locale, setLocale] = useState(props.preferences.locale);
  const [themePreference, setThemePreference] = useState(props.preferences.themePreference);
  const [defaultCountryIso, setDefaultCountryIso] = useState(
    props.preferences.defaultCountryIso ?? '',
  );
  const currentPreferencesRef = useRef({ locale, themePreference, defaultCountryIso });
  const savedPreferencesRef = useRef(currentPreferencesRef.current);
  const pendingFieldRef = useRef<'locale' | 'theme' | 'country' | null>(null);
  const shouldSubmitRef = useRef(false);
  const { setPreference } = useTheme();
  const router = useRouter();
  const [state, action, isPending] = useActionState(
    updateAccountPreferencesAction,
    ACCOUNT_SETTINGS_INITIAL_STATE,
  );
  useEffect(() => {
    if (state.status === 'success') {
      savedPreferencesRef.current = currentPreferencesRef.current;
      if (pendingFieldRef.current === 'locale') router.refresh();
      pendingFieldRef.current = null;
      return;
    }

    if (state.status === 'error') {
      const saved = savedPreferencesRef.current;
      currentPreferencesRef.current = saved;
      setLocale(saved.locale);
      setThemePreference(saved.themePreference);
      setDefaultCountryIso(saved.defaultCountryIso);
      setPreference(saved.themePreference);
      pendingFieldRef.current = null;
    }
  }, [router, setPreference, state]);
  useEffect(() => {
    if (!shouldSubmitRef.current) return;
    shouldSubmitRef.current = false;
    formRef.current?.requestSubmit();
  }, [defaultCountryIso, locale, themePreference]);
  return (
    <form ref={formRef} action={action} className={accountClasses.section}>
      <h2 className={accountClasses.sectionTitle}>{t('preferences.title')}</h2>
      <p className={accountClasses.sectionHint}>{t('preferences.hint')}</p>
      <div className={accountClasses.field}>
        <Label htmlFor={ACCOUNT_SETTINGS_FIELD_NAMES.locale}>{props.labels.locale}</Label>
        <Select
          id={ACCOUNT_SETTINGS_FIELD_NAMES.locale}
          name={ACCOUNT_SETTINGS_FIELD_NAMES.locale}
          value={locale}
          disabled={isPending}
          onChange={(event) => {
            const nextLocale = event.currentTarget.value as typeof locale;
            setLocale(nextLocale);
            currentPreferencesRef.current = {
              ...currentPreferencesRef.current,
              locale: nextLocale,
            };
            pendingFieldRef.current = 'locale';
            shouldSubmitRef.current = true;
          }}
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
          value={themePreference}
          disabled={isPending}
          onChange={(event) => {
            const nextTheme = event.currentTarget.value as ThemePreference;
            setThemePreference(nextTheme);
            currentPreferencesRef.current = {
              ...currentPreferencesRef.current,
              themePreference: nextTheme,
            };
            pendingFieldRef.current = 'theme';
            shouldSubmitRef.current = true;
            setPreference(nextTheme);
          }}
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
          value={defaultCountryIso}
          disabled={isPending}
          onChange={(event) => {
            const nextCountryIso = event.currentTarget.value;
            setDefaultCountryIso(nextCountryIso);
            currentPreferencesRef.current = {
              ...currentPreferencesRef.current,
              defaultCountryIso: nextCountryIso,
            };
            pendingFieldRef.current = 'country';
            shouldSubmitRef.current = true;
          }}
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
      {isPending ? (
        <p className={accountClasses.sectionHint} role="status">
          {props.labels.pending}
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
