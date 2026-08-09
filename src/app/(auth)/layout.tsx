import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';

import { authClasses } from '@/modules/auth';
import { buildThemeOptions } from '@/modules/preferences';
import { ThemeToggleContainer } from '@/modules/preferences/preferences-ui';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';
import { AppLink } from '@/packages/link';
import { SiteShell } from '@/shared/components/layout/site-shell.component';
import { siteShellClasses } from '@/shared/components/layout/site-shell.variants';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Credential pages share the platform chrome minus the marketing navigation. */
export default async function AuthLayout(props: {
  readonly children: ReactNode;
}): Promise<ReactElement> {
  const tApp = await getServerTranslations(I18N_NAMESPACES.app);

  return (
    <SiteShell
      navigationLabel={tApp('name')}
      brand={
        <AppLink href={ROUTE_PATHS.home} className={siteShellClasses.brand}>
          <span className={siteShellClasses.brandName}>{tApp('name')}</span>
        </AppLink>
      }
      navigation={
        <AppLink href={ROUTE_PATHS.home} className={siteShellClasses.navLink}>
          {tApp('tagline')}
        </AppLink>
      }
      actions={
        <ThemeToggleContainer label={tApp('theme.label')} options={buildThemeOptions(tApp)} />
      }
      footerNote={tApp('footerNote')}
      footerLinks={null}
    >
      <div className={authClasses.page}>{props.children}</div>
    </SiteShell>
  );
}
