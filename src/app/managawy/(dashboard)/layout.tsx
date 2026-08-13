import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';

import {
  AdminAccountMenu,
  AdminShell,
  AdminSignOutButtonContainer,
  AdminTopBar,
} from '@/modules/admin/admin-ui';
import {
  ADMIN_NAV_ITEMS,
  ADMIN_SHELL_BRAND_LABEL,
  ADMIN_SHELL_NAV_ARIA_LABEL,
  buildAdminNavItemViews,
  requireAdmin,
} from '@/modules/admin/server';
import { HeaderLocalizationControlsContainer } from '@/modules/localization';
import { buildThemeOptions } from '@/modules/preferences';
import { ThemeToggleContainer } from '@/modules/preferences/preferences-ui';
import { getRequestPathname } from '@/packages/headers';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Scoped to the `(dashboard)` route group — a route group rather than a
 * segment folder, so it changes nothing about the URL — deliberately
 * separate from `src/app/managawy/layout.tsx`. `/managawy/sign-in` and
 * `/managawy/two-factor/enroll` sit outside this group precisely so they
 * are never wrapped by `requireAdmin`: an unauthenticated visitor at
 * `/managawy/sign-in`, or a password-only session at
 * `/managawy/two-factor/enroll`, would otherwise be redirected back to the
 * very page they are already on, forever.
 */
export default async function AdminDashboardLayout(props: {
  readonly children: ReactNode;
}): Promise<ReactElement> {
  // A minimum-bar "is this a real, fully authenticated admin" check, not a
  // fine-grained content gate — `USERS_VIEW` is the one permission every
  // role (including MODERATOR) is guaranteed to have by default.
  const admin = await requireAdmin('USERS_VIEW');
  const t = await getServerTranslations(I18N_NAMESPACES.admin);
  const pathname = (await getRequestPathname()) ?? ROUTE_PATHS.managawy;
  const changePasswordHref = `${ROUTE_PATHS.managawyAccount}#change-password`;

  return (
    <AdminShell
      navItems={buildAdminNavItemViews(ADMIN_NAV_ITEMS, pathname)}
      brandLabel={ADMIN_SHELL_BRAND_LABEL}
      navAriaLabel={ADMIN_SHELL_NAV_ARIA_LABEL}
      topBar={
        <AdminTopBar
          homeHref={ROUTE_PATHS.home}
          homeLabel={t('topBar.homeLabel')}
          brandLabel={ADMIN_SHELL_BRAND_LABEL}
          actions={
            <>
              <ThemeToggleContainer label={t('theme.label')} options={buildThemeOptions(t)} />
              <HeaderLocalizationControlsContainer />
            </>
          }
          accountMenu={
            <AdminAccountMenu
              name={admin.name}
              email={admin.email}
              roleName={t(`roles.${admin.role}`)}
              menuLabel={t('topBar.accountMenuLabel')}
              preferencesHref={ROUTE_PATHS.managawyAccount}
              preferencesLabel={t('topBar.preferencesLink')}
              changePasswordHref={changePasswordHref}
              changePasswordLabel={t('topBar.changePasswordLink')}
              logout={<AdminSignOutButtonContainer />}
            />
          }
        />
      }
    >
      {props.children}
    </AdminShell>
  );
}
