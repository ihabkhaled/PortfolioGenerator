import type { Metadata, Viewport } from 'next';
import type { ReactElement, ReactNode } from 'react';

import { APP_LOCALE } from '@/packages/i18n';
import { AppToaster } from '@/packages/toast';
import { appFontClassName } from '@/shared/fonts/app-fonts';

import './styles.css';

/**
 * Root layout for the whole platform: the dashboard, the auth pages and every
 * published portfolio. Portfolio pages override `data-theme` and `lang` on
 * their own subtree so a tenant's theme and content language apply without a
 * second HTML document.
 */

export const metadata: Metadata = {
  title: {
    default: 'PortfolioGenerate',
    template: '%s · PortfolioGenerate',
  },
  description: 'Turn a CV into a portfolio you control.',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f8fa' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' },
  ],
};

export default function RootLayout(props: { readonly children: ReactNode }): ReactElement {
  return (
    <html lang={APP_LOCALE} data-theme="light" className={appFontClassName}>
      <body>
        {props.children}
        <AppToaster />
      </body>
    </html>
  );
}
