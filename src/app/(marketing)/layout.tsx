import type { ReactElement, ReactNode } from 'react';

import { getCurrentUser } from '@/modules/auth/server';
import { buildThemeOptions } from '@/modules/preferences';
import { ThemeToggleContainer } from '@/modules/preferences/preferences-ui';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';
import { HomeIcon } from '@/packages/icons';
import { AppLink } from '@/packages/link';
import { SiteAuthNav } from '@/shared/components/layout/site-auth-nav.component';
import { SiteFooterNav } from '@/shared/components/layout/site-footer-nav.component';
import { SiteShell } from '@/shared/components/layout/site-shell.component';
import { siteShellClasses } from '@/shared/components/layout/site-shell.variants';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';
import { buildSiteFooterLinks } from '@/shared/utils/site-footer-links.util';

export default async function MarketingLayout(
  props: Readonly<{ children: ReactNode }>,
): Promise<ReactElement> {
  const [user, t] = await Promise.all([
    getCurrentUser(),
    getServerTranslations(I18N_NAMESPACES.app),
  ]);

  return (
    <SiteShell
      navigationLabel={t('name')}
      brandName={t('name')}
      homeLink={
        <AppLink
          href={ROUTE_PATHS.home}
          aria-label={t('nav.home')}
          className={siteShellClasses.homeLink}
        >
          <HomeIcon aria-hidden size={18} />
        </AppLink>
      }
      menuLabel={t('nav.menu')}
      brand={
        <AppLink href={ROUTE_PATHS.home} className={siteShellClasses.brand}>
          <span className={siteShellClasses.brandName}>{t('name')}</span>
        </AppLink>
      }
      navigation={
        <SiteAuthNav
          isSignedIn={user !== null}
          dashboardHref={ROUTE_PATHS.dashboard}
          signInHref={ROUTE_PATHS.signIn}
          signUpHref={ROUTE_PATHS.signUp}
          dashboardLabel={t('nav.dashboard')}
          signInLabel={t('nav.signIn')}
          signUpLabel={t('nav.signUp')}
        />
      }
      actions={<ThemeToggleContainer label={t('theme.label')} options={buildThemeOptions(t)} />}
      footerNote={t('footerNote')}
      footerLinks={<SiteFooterNav columns={buildSiteFooterLinks(t)} />}
    >
      {props.children}
    </SiteShell>
  );
}
