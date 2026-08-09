import type { ReactElement, ReactNode } from 'react';

import { buildThemeOptions } from '@/modules/preferences';
import { ThemeToggleContainer } from '@/modules/preferences/preferences-ui';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';
import { AppLink } from '@/packages/link';
import { SiteShell } from '@/shared/components/layout/site-shell.component';
import { siteShellClasses } from '@/shared/components/layout/site-shell.variants';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

export default async function MarketingLayout(
  props: Readonly<{ children: ReactNode }>,
): Promise<ReactElement> {
  const t = await getServerTranslations(I18N_NAMESPACES.app);
  return (
    <SiteShell
      navigationLabel={t('name')}
      brand={
        <AppLink href={ROUTE_PATHS.home} className={siteShellClasses.brandName}>
          {t('name')}
        </AppLink>
      }
      navigation={
        <AppLink href={ROUTE_PATHS.signUp} className={siteShellClasses.navLink}>
          {t('nav.signUp')}
        </AppLink>
      }
      actions={<ThemeToggleContainer label={t('theme.label')} options={buildThemeOptions(t)} />}
      footerNote={t('footerNote')}
      footerLinks={
        <AppLink href={ROUTE_PATHS.home} className={siteShellClasses.footerLink}>
          {t('name')}
        </AppLink>
      }
    >
      {props.children}
    </SiteShell>
  );
}
