import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import type { AccountPreferences } from '@/modules/account';
import {
  accountClasses,
  AccountProfileContainer,
  AccountSummary,
  AccountPreferencesContainer,
  AccountSecurityContainer,
  DeleteAccountContainer,
} from '@/modules/account/account-ui';
import { getOwnedAccountPreferences, listAccountSessions } from '@/modules/account/server';
import { requireOwner } from '@/modules/auth/server';
import { APP_LOCALES } from '@/modules/localization';
import { describeBillingStatus } from '@/modules/payments';
import {
  BillingStatusBanner,
  paymentsClasses,
  PaypalCheckoutContainer,
} from '@/modules/payments/payments-ui';
import { getOwnerBillingState } from '@/modules/payments/server';
import { listOwnedPortfolios } from '@/modules/portfolios/server';
import { publicEnv } from '@/packages/env';
import { getServerEnv } from '@/packages/env/server';
import { getRequestHeaders } from '@/packages/headers';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';
import { THEME_PREFERENCES } from '@/packages/theme';
import { COUNTRY_DIAL_CODES } from '@/shared/constants/country-codes.constants';

export const metadata: Metadata = {
  title: 'Account',
  robots: { index: false, follow: false },
};

/**
 * Account and data.
 *
 * The retention rules are written on the page rather than buried in a policy
 * document, because the person who needs them is the one standing in front of
 * the delete button.
 */
export default async function AccountSettingsPage(): Promise<ReactElement> {
  const owner = await requireOwner();
  const t = await getServerTranslations(I18N_NAMESPACES.account);
  const paymentsT = await getServerTranslations(I18N_NAMESPACES.payments);
  const portfolios = await listOwnedPortfolios(owner.id);
  const sessions = await listAccountSessions(owner.id, await getRequestHeaders());
  const preferences: AccountPreferences = (await getOwnedAccountPreferences(owner.id)) ?? {
    locale: 'en',
    themePreference: 'system',
    defaultCountryIso: null,
  };

  const billingState = await getOwnerBillingState(owner.id);
  const billingView =
    billingState === null ? null : describeBillingStatus(billingState, new Date());
  const billingPriceLabel = `$${getServerEnv().NEXT_PAYMENT_PRICE}`;
  const billingMessage =
    billingView === null
      ? null
      : paymentsT(`billing.status.${billingView.tag}`, { days: billingView.daysRemaining ?? 0 });

  return (
    <div className={accountClasses.page}>
      <header className={accountClasses.header}>
        <h1 className={accountClasses.title}>{t('title')}</h1>
        <p className={accountClasses.lead}>{t('lead')}</p>
      </header>

      <AccountSummary
        title={t('summary.title')}
        nameLabel={t('summary.nameLabel')}
        name={owner.name}
        emailLabel={t('summary.emailLabel')}
        email={owner.email}
        portfolioCountLabel={t('summary.portfolioCountLabel')}
        portfolioCount={portfolios.length}
      />

      <section className={paymentsClasses.section}>
        <h2 className={paymentsClasses.sectionTitle}>{paymentsT('billing.title')}</h2>
        <p className={paymentsClasses.sectionHint}>
          {paymentsT('billing.hint', { price: billingPriceLabel })}
        </p>

        {billingView === null || billingMessage === null ? null : (
          <BillingStatusBanner tag={billingView.tag} message={billingMessage} />
        )}

        {billingView !== null &&
        billingView.tag !== 'active' &&
        publicEnv.NEXT_PUBLIC_PAYPAL_CLIENT_ID !== undefined ? (
          <PaypalCheckoutContainer
            ownerId={owner.id}
            clientId={publicEnv.NEXT_PUBLIC_PAYPAL_CLIENT_ID}
            labels={{
              unavailable: paymentsT('billing.checkout.unavailable'),
              processing: paymentsT('billing.checkout.processing'),
              succeeded: paymentsT('billing.checkout.succeeded'),
              failed: paymentsT('billing.checkout.failed'),
            }}
          />
        ) : null}

        {billingView?.tag === 'active' ? (
          <p className={paymentsClasses.sectionHint}>{paymentsT('billing.activeNote')}</p>
        ) : null}
      </section>

      <AccountProfileContainer
        name={owner.name}
        labels={{
          title: t('profile.title'),
          hint: t('profile.hint'),
          name: t('profile.name'),
          submit: t('profile.submit'),
          pending: t('profile.pending'),
          saved: t('profile.saved'),
        }}
      />

      <AccountSecurityContainer
        email={owner.email}
        emailVerified={owner.emailVerified}
        sessions={sessions}
        labels={{
          title: t('security.title'),
          hint: t('security.hint'),
          verificationTitle: t('security.verificationTitle'),
          verified: t('security.verified'),
          unverified: t('security.unverified'),
          resend: t('security.resend'),
          sending: t('security.sending'),
          sent: t('security.sent'),
          passwordTitle: t('security.passwordTitle'),
          currentPassword: t('security.currentPassword'),
          newPassword: t('security.newPassword'),
          showPassword: t('security.showPassword'),
          hidePassword: t('security.hidePassword'),
          changePassword: t('security.changePassword'),
          changingPassword: t('security.changingPassword'),
          passwordChanged: t('security.passwordChanged'),
          sessionsTitle: t('security.sessionsTitle'),
          currentSession: t('security.currentSession'),
          revoke: t('security.revoke'),
          revoking: t('security.revoking'),
          created: t('security.created'),
          expires: t('security.expires'),
          unknownDevice: t('security.unknownDevice'),
          unknownAddress: t('security.unknownAddress'),
          noSessions: t('security.noSessions'),
        }}
      />

      <AccountPreferencesContainer
        preferences={preferences}
        localeOptions={APP_LOCALES.map((locale) => ({
          value: locale,
          label: t(`preferences.locales.${locale}`),
        }))}
        themeOptions={THEME_PREFERENCES.map((theme) => ({
          value: theme,
          label: t(`preferences.themes.${theme}`),
        }))}
        countryOptions={COUNTRY_DIAL_CODES.map((country) => ({
          value: country.iso,
          label: `${country.name} (${country.dial})`,
        }))}
        labels={{
          locale: t('preferences.locale'),
          theme: t('preferences.theme'),
          country: t('preferences.country'),
          noCountry: t('preferences.noCountry'),
          submit: t('preferences.submit'),
          pending: t('preferences.pending'),
          saved: t('preferences.saved'),
        }}
      />

      <section className={accountClasses.section}>
        <h2 className={accountClasses.sectionTitle}>{t('data.title')}</h2>
        <p className={accountClasses.sectionHint}>{t('data.hint')}</p>
        <h3 className={accountClasses.sectionTitle}>{t('data.retentionTitle')}</h3>
        <p className={accountClasses.sectionHint}>{t('data.retention')}</p>
      </section>

      <DeleteAccountContainer />
    </div>
  );
}
