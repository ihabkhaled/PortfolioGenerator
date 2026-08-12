'use client';
// client-boundary-reason: portfolio share and clipboard actions require browser APIs.

import type { ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation, useI18nLocale } from '@/packages/i18n';

import { DEFAULT_LOCALE } from '../constants/locale.constants';
import { isAppLocale } from '../helpers/locale-path.helper';

import { LocalizationControlsContainer } from './localization-controls.container';

/** Compact public-reader actions placed beside the PDF download. */
export function PortfolioShareControlsContainer(): ReactElement {
  const requestedLocale = useI18nLocale();
  const locale = isAppLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE;
  const t = useAppTranslation(I18N_NAMESPACES.localization);

  return (
    <LocalizationControlsContainer
      locale={locale}
      options={[]}
      label={t('label')}
      copyUrl={t('copyUrl')}
      shareUrl={t('shareUrl')}
      copied={t('copied')}
      showLocale={false}
      showReaderActions
    />
  );
}
