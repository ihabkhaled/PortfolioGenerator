import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import {
  AdminAccountSummary,
  AdminChangePasswordFormContainer,
  adminAccountClasses,
} from '@/modules/admin/admin-ui';
import { requireAdmin } from '@/modules/admin/server';
import { HeaderLocalizationControlsContainer } from '@/modules/localization';
import { buildThemeOptions } from '@/modules/preferences';
import { ThemeToggleContainer } from '@/modules/preferences/preferences-ui';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';

export const metadata: Metadata = {
  title: 'Admin preferences & security',
  robots: { index: false, follow: false },
};

/**
 * The admin's own self-service page: what the platform knows about them,
 * their own password, and the same theme/language controls the top bar's
 * dropdown offers — reachable here as a real page rather than only inside a
 * `<details>` panel.
 */
export default async function ManagawyAccountPage(): Promise<ReactElement> {
  const admin = await requireAdmin('USERS_VIEW');
  const t = await getServerTranslations(I18N_NAMESPACES.admin);

  return (
    <div className={adminAccountClasses.page}>
      <header className={adminAccountClasses.header}>
        <h1 className={adminAccountClasses.title}>{t('account.title')}</h1>
        <p className={adminAccountClasses.lead}>{t('account.lead')}</p>
      </header>

      <AdminAccountSummary
        title={t('account.summary.title')}
        nameLabel={t('account.summary.nameLabel')}
        name={admin.name}
        emailLabel={t('account.summary.emailLabel')}
        email={admin.email}
        roleLabel={t('account.summary.roleLabel')}
        roleName={t(`roles.${admin.role}`)}
        permissionsLabel={t('account.summary.permissionsLabel')}
        permissions={admin.permissions}
      />

      <AdminChangePasswordFormContainer />

      <section className={adminAccountClasses.section}>
        <h2 className={adminAccountClasses.sectionTitle}>{t('account.preferences.title')}</h2>
        <p className={adminAccountClasses.sectionHint}>{t('account.preferences.hint')}</p>
        <ThemeToggleContainer label={t('theme.label')} options={buildThemeOptions(t)} />
        <HeaderLocalizationControlsContainer />
      </section>
    </div>
  );
}
