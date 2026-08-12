import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import type { ReactElement, ReactNode } from 'react';

import { DEFAULT_LOCALE, getLocaleDirection, isAppLocale } from '@/modules/localization';
import { PwaRegistrationContainer } from '@/modules/pwa/pwa-ui';
import { AdSenseScript } from '@/modules/seo';
import { appOrigin } from '@/packages/env';
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
  metadataBase: new URL(appOrigin),
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'ProFolio' },
  icons: {
    icon: [
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' }],
  },
  title: {
    default: 'ProFolio',
    template: '%s · ProFolio',
  },
  description: 'Turn a CV into a portfolio you control.',
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
  },
  openGraph: {
    type: 'website',
    siteName: 'ProFolio',
    title: 'ProFolio',
    description: 'Turn a CV into a portfolio you control.',
    images: [{ url: '/platform-share-card.svg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProFolio',
    description: 'Turn a CV into a portfolio you control.',
    images: ['/platform-share-card.svg'],
  },
  robots: { index: true, follow: true },
  other: { 'google-adsense-account': ADSENSE_CLIENT_ID },
};

export const viewport: Viewport = {
  viewportFit: 'cover',
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
  const tApp = await getServerTranslations(I18N_NAMESPACES.app, locale);

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
          <AppToaster />
          <PwaRegistrationContainer
            installTitle={tApp('pwa.installTitle')}
            installDescription={tApp('pwa.installDescription')}
            installAction={tApp('pwa.installAction')}
            updateTitle={tApp('pwaUpdate.title')}
            updateDescription={tApp('pwaUpdate.description')}
            updateAction={tApp('pwaUpdate.action')}
            dismissLabel={tApp('pwa.dismiss')}
          />
        </I18nLocaleProvider>
      </body>
    </html>
  );
}
