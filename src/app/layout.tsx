import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import type { ReactElement, ReactNode } from 'react';

import {
  APP_LOCALES,
  DEFAULT_LOCALE,
  getLocaleDirection,
  isAppLocale,
  LocalizationControlsContainer,
} from '@/modules/localization';
import { PwaRegistrationContainer } from '@/modules/pwa/pwa-ui';
import { AdSenseScript } from '@/modules/seo';
import { I18nLocaleProvider, I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';
import { buildThemeScript } from '@/packages/theme';
import { AppToaster } from '@/packages/toast';
import { ADSENSE_CLIENT_ID } from '@/shared/constants/advertising.constants';
import { appFontClassName } from '@/shared/fonts/app-fonts';
import { toInlineScript } from '@/shared/utils/inline-script.util';

import './styles.css';

/**
 * Root layout for the whole platform: the dashboard, the auth pages and every
 * published portfolio. Portfolio pages override `lang` on their own subtree so
 * a tenant's content language applies without a second HTML document.
 *
 * `data-theme` is stamped by the inline script below rather than rendered,
 * because the correct value lives in the reader's browser and the server has no
 * way to know it. `suppressHydrationWarning` on `<html>` is the price: React
 * would otherwise complain about the attribute it did not write.
 */

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'PortfolioGenerate' },
  icons: { icon: [{ url: '/icon.svg', type: 'image/svg+xml' }], apple: '/icon.svg' },
  title: {
    default: 'PortfolioGenerate',
    template: '%s · PortfolioGenerate',
  },
  description: 'Turn a CV into a portfolio you control.',
  robots: { index: true, follow: true },
  other: { 'google-adsense-account': ADSENSE_CLIENT_ID },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f8fa' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' },
  ],
};

export default async function RootLayout(props: {
  readonly children: ReactNode;
}): Promise<ReactElement> {
  const requestHeaders = await headers();
  const nonce = requestHeaders.get('x-nonce') ?? undefined;
  const requestedLocale = requestHeaders.get('x-app-locale') ?? DEFAULT_LOCALE;
  const locale = isAppLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE;
  const tLocalization = await getServerTranslations(I18N_NAMESPACES.localization, locale);
  const tErrors = await getServerTranslations(I18N_NAMESPACES.errors, locale);

  return (
    <html
      lang={locale}
      dir={getLocaleDirection(locale)}
      className={appFontClassName}
      suppressHydrationWarning
    >
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={toInlineScript(buildThemeScript())} />
        <AdSenseScript nonce={nonce} />
      </head>
      <body>
        <I18nLocaleProvider locale={locale}>
          {props.children}
          <LocalizationControlsContainer
            locale={locale}
            options={APP_LOCALES.map((option) => ({
              value: option,
              label: tLocalization(`locales.${option}`),
            }))}
            label={tLocalization('label')}
            copyUrl={tLocalization('copyUrl')}
            copied={tLocalization('copied')}
          />
          <AppToaster />
          <PwaRegistrationContainer
            updateTitle={tErrors('title')}
            updateDescription={tErrors('lead')}
            updateAction={tErrors('retry')}
          />
        </I18nLocaleProvider>
      </body>
    </html>
  );
}
