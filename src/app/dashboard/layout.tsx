import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';

import { SignOutButtonContainer } from '@/modules/auth';
import { getCurrentUser } from '@/modules/auth/server';
import { buildThemeOptions } from '@/modules/preferences';
import { ThemeToggleContainer } from '@/modules/preferences/preferences-ui';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';
import { HomeIcon } from '@/packages/icons';
import { AppLink } from '@/packages/link';
import { appRedirect } from '@/packages/navigation';
import { LANDMARK_IDS } from '@/shared/accessibility/landmark-ids.constants';
import { AccountMenu } from '@/shared/components/layout/account-menu.component';
import { SiteFooterNav } from '@/shared/components/layout/site-footer-nav.component';
import { SiteShell } from '@/shared/components/layout/site-shell.component';
import { siteShellClasses } from '@/shared/components/layout/site-shell.variants';
import { SkipLink } from '@/shared/components/primitives/skip-link.component';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';
import { buildSiteFooterLinks } from '@/shared/utils/site-footer-links.util';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * The authorization boundary for the whole dashboard.
 *
 * Checked here as well as in every action, not instead of: a layout guard
 * gives the user a redirect instead of an error page, and the per-action check
 * is what actually protects the data, since a server action is reachable
 * without ever rendering this layout.
 */
export default async function DashboardLayout(props: {
  readonly children: ReactNode;
}): Promise<ReactElement> {
  const user = await getCurrentUser();

  if (user === null) {
    appRedirect(ROUTE_PATHS.signIn);
  }

  const tApp = await getServerTranslations(I18N_NAMESPACES.app);

  return (
    <>
      <SkipLink targetHref={`#${LANDMARK_IDS.mainContent}`} label={tApp('skipToContent')} />
      <SiteShell
        account={
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
        }
        navigationLabel={tApp('nav.dashboard')}
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
          <AppLink href={ROUTE_PATHS.dashboard} className={siteShellClasses.brand}>
            <span className={siteShellClasses.brandName}>{tApp('name')}</span>
            <span className={siteShellClasses.brandEmail}>{user.email}</span>
          </AppLink>
        }
        navigation={null}
        actions={
          <ThemeToggleContainer label={tApp('theme.label')} options={buildThemeOptions(tApp)} />
        }
        footerNote={tApp('footerNote')}
        footerLinks={<SiteFooterNav columns={buildSiteFooterLinks(tApp)} />}
      >
        {props.children}
      </SiteShell>
    </>
  );
}
