import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';

import { authClasses, SignOutButtonContainer } from '@/modules/auth';
import { getCurrentUser } from '@/modules/auth/server';
import { HeaderLocalizationControlsContainer } from '@/modules/localization';
import { buildThemeOptions } from '@/modules/preferences';
import { ThemeToggleContainer } from '@/modules/preferences/preferences-ui';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';
import { HomeIcon } from '@/packages/icons';
import { AppLink } from '@/packages/link';
import { AccountMenu } from '@/shared/components/layout/account-menu.component';
import { SiteFooterNav } from '@/shared/components/layout/site-footer-nav.component';
import { SiteShell } from '@/shared/components/layout/site-shell.component';
import { siteShellClasses } from '@/shared/components/layout/site-shell.variants';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';
import { buildSiteFooterLinks } from '@/shared/utils/site-footer-links.util';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Credential pages share the platform chrome minus the marketing navigation. */
export default async function AuthLayout(props: {
  readonly children: ReactNode;
}): Promise<ReactElement> {
  const [user, tApp] = await Promise.all([
    getCurrentUser(),
    getServerTranslations(I18N_NAMESPACES.app),
  ]);

  return (
    <SiteShell
      account={
        user === null ? undefined : (
          <AccountMenu
            name={user.name}
            email={user.email}
            menuLabel={tApp('nav.accountMenu')}
            dashboardHref={ROUTE_PATHS.dashboard}
            dashboardLabel={tApp('nav.dashboard')}
            preferencesHref={ROUTE_PATHS.dashboardSettings}
            preferencesLabel={tApp('nav.preferences')}
            logout={<SignOutButtonContainer />}
          />
        )
      }
      navigationLabel={tApp('name')}
      brandName={tApp('name')}
      homeLink={
        <AppLink
          href={ROUTE_PATHS.home}
          aria-label={tApp('nav.home')}
          className={siteShellClasses.homeLink}
        >
          <HomeIcon aria-hidden size={18} />
        </AppLink>
      }
      menuLabel={tApp('nav.menu')}
      brand={
        <AppLink href={ROUTE_PATHS.home} className={siteShellClasses.brand}>
          <span className={siteShellClasses.brandName}>{tApp('name')}</span>
        </AppLink>
      }
      navigation={
        user === null ? (
          <AppLink href={ROUTE_PATHS.home} className={siteShellClasses.navLink}>
            {tApp('tagline')}
          </AppLink>
        ) : (
          <AppLink href={ROUTE_PATHS.dashboard} className={siteShellClasses.navLink}>
            {tApp('nav.dashboard')}
          </AppLink>
        )
      }
      actions={
        <>
          <ThemeToggleContainer label={tApp('theme.label')} options={buildThemeOptions(tApp)} />
          <HeaderLocalizationControlsContainer />
        </>
      }
      footerNote={tApp('footerNote')}
      footerLinks={<SiteFooterNav columns={buildSiteFooterLinks(tApp)} />}
    >
      <div className={authClasses.page}>{props.children}</div>
    </SiteShell>
  );
}
