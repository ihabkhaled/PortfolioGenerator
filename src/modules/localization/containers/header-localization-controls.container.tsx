'use client';
// client-boundary-reason: the header language selector reads the active locale
// context and navigates without coupling server layouts to locale detection.

import type { ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation, useI18nLocale } from '@/packages/i18n';

import { APP_LOCALES, DEFAULT_LOCALE } from '../constants/locale.constants';
import { isAppLocale } from '../helpers/locale-path.helper';

import { LocalizationControlsContainer } from './localization-controls.container';

/** Language, copy and share controls rendered directly inside the owning shell. */
export function HeaderLocalizationControlsContainer(): ReactElement {
  const requestedLocale = useI18nLocale();
  const locale = isAppLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE;
  const t = useAppTranslation(I18N_NAMESPACES.localization);

  return (
    <LocalizationControlsContainer
      locale={locale}
      options={APP_LOCALES.map((value) => ({ value, label: t(`locales.${value}`) }))}
      label={t('label')}
      copyUrl={t('copyUrl')}
      shareUrl={t('shareUrl')}
      copied={t('copied')}
      showReaderActions={false}
    />
  );
}
