import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import type { ReactElement, ReactNode } from 'react';

import { APP_LOCALE } from '@/packages/i18n';
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

  return (
    <html lang={APP_LOCALE} className={appFontClassName} suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={toInlineScript(buildThemeScript())} />
      </head>
      <body>
        {props.children}
        <AppToaster />
      </body>
    </html>
  );
}
