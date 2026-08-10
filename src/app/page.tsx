import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { getCurrentUser } from '@/modules/auth/server';
import { DEFAULT_LOCALE, isAppLocale } from '@/modules/localization';
import {
  LandingCta,
  LandingDirectory,
  LandingFaq,
  LandingHero,
  LandingPrincipleList,
  LandingStepList,
  MARKETING_PAGES,
  type LandingDirectoryItem,
  type LandingFaqItem,
  type LandingPrinciple,
  type LandingStep,
} from '@/modules/marketing';
import { buildThemeOptions } from '@/modules/preferences';
import { ThemeToggleContainer } from '@/modules/preferences/preferences-ui';
import { buildPlatformMetadataAlternates } from '@/modules/seo';
import { getRequestLocale } from '@/packages/headers';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';
import { HomeIcon } from '@/packages/icons';
import { AppLink, toAppRoute } from '@/packages/link';
import { buttonVariants } from '@/packages/ui-primitives';
import { LANDMARK_IDS } from '@/shared/accessibility/landmark-ids.constants';
import { ManifestPanel } from '@/shared/components/data-display/manifest-panel.component';
import { Section } from '@/shared/components/data-display/section.component';
import { sectionClasses } from '@/shared/components/data-display/section.variants';
import { SiteAuthNav } from '@/shared/components/layout/site-auth-nav.component';
import { SiteFooterNav } from '@/shared/components/layout/site-footer-nav.component';
import { SiteShell } from '@/shared/components/layout/site-shell.component';
import { siteShellClasses } from '@/shared/components/layout/site-shell.variants';
import { SkipLink } from '@/shared/components/primitives/skip-link.component';
import { MARKETING_ROUTE_PATHS, ROUTE_PATHS } from '@/shared/constants/route-paths.constants';
import { buildSiteFooterLinks } from '@/shared/utils/site-footer-links.util';

export async function generateMetadata(): Promise<Metadata> {
  const requestedLocale = await getRequestLocale();
  const locale =
    requestedLocale !== null && isAppLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE;

  return { alternates: buildPlatformMetadataAlternates(ROUTE_PATHS.home, locale) };
}

export default async function LandingPage(): Promise<ReactElement> {
  const [user, tApp, t] = await Promise.all([
    getCurrentUser(),
    getServerTranslations(I18N_NAMESPACES.app),
    getServerTranslations(I18N_NAMESPACES.marketing),
  ]);

  const steps: readonly LandingStep[] = [
    {
      id: 'upload',
      index: '01',
      title: t('steps.uploadTitle'),
      description: t('steps.uploadBody'),
    },
    {
      id: 'review',
      index: '02',
      title: t('steps.reviewTitle'),
      description: t('steps.reviewBody'),
    },
    {
      id: 'compose',
      index: '03',
      title: t('steps.composeTitle'),
      description: t('steps.composeBody'),
    },
    {
      id: 'publish',
      index: '04',
      title: t('steps.publishTitle'),
      description: t('steps.publishBody'),
    },
  ];

  const principles: readonly LandingPrinciple[] = [
    {
      id: 'control',
      title: t('principles.controlTitle'),
      description: t('principles.controlBody'),
    },
    {
      id: 'privacy',
      title: t('principles.privacyTitle'),
      description: t('principles.privacyBody'),
    },
    { id: 'honest', title: t('principles.honestTitle'), description: t('principles.honestBody') },
    { id: 'fast', title: t('principles.fastTitle'), description: t('principles.fastBody') },
  ];

  const directory: readonly LandingDirectoryItem[] = MARKETING_PAGES.map((page) => ({
    id: page.slug,
    title: t(page.titleKey),
    description: t(page.descriptionKey),
    href: toAppRoute(MARKETING_ROUTE_PATHS[page.slug]),
  }));

  const useCases: readonly LandingPrinciple[] = [
    {
      id: 'engineer',
      title: t('landing.useCases.engineerTitle'),
      description: t('landing.useCases.engineerBody'),
    },
    {
      id: 'designer',
      title: t('landing.useCases.designerTitle'),
      description: t('landing.useCases.designerBody'),
    },
    {
      id: 'graduate',
      title: t('landing.useCases.graduateTitle'),
      description: t('landing.useCases.graduateBody'),
    },
    {
      id: 'consultant',
      title: t('landing.useCases.consultantTitle'),
      description: t('landing.useCases.consultantBody'),
    },
  ];

  const trustDetails: readonly LandingPrinciple[] = [
    {
      id: 'draft',
      title: t('landing.trust.draftTitle'),
      description: t('landing.trust.draftBody'),
    },
    {
      id: 'snapshot',
      title: t('landing.trust.snapshotTitle'),
      description: t('landing.trust.snapshotBody'),
    },
    {
      id: 'ownership',
      title: t('landing.trust.ownershipTitle'),
      description: t('landing.trust.ownershipBody'),
    },
    {
      id: 'access',
      title: t('landing.trust.accessTitle'),
      description: t('landing.trust.accessBody'),
    },
  ];

  const faq: readonly LandingFaqItem[] = [
    {
      id: 'publish',
      question: t('landing.faq.publishQuestion'),
      answer: t('landing.faq.publishAnswer'),
    },
    {
      id: 'missing',
      question: t('landing.faq.missingQuestion'),
      answer: t('landing.faq.missingAnswer'),
    },
    { id: 'cv', question: t('landing.faq.cvQuestion'), answer: t('landing.faq.cvAnswer') },
    {
      id: 'outage',
      question: t('landing.faq.outageQuestion'),
      answer: t('landing.faq.outageAnswer'),
    },
    { id: 'many', question: t('landing.faq.manyQuestion'), answer: t('landing.faq.manyAnswer') },
  ];

  return (
    <>
      <SkipLink targetHref={`#${LANDMARK_IDS.mainContent}`} label={tApp('skipToContent')} />
      <SiteShell
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
            <span className={siteShellClasses.brandRole}>{tApp('tagline')}</span>
          </AppLink>
        }
        navigation={
          <SiteAuthNav
            isSignedIn={user !== null}
            dashboardHref={ROUTE_PATHS.dashboard}
            signInHref={ROUTE_PATHS.signIn}
            signUpHref={ROUTE_PATHS.signUp}
            dashboardLabel={tApp('nav.dashboard')}
            signInLabel={tApp('nav.signIn')}
            signUpLabel={tApp('nav.signUp')}
          />
        }
        actions={
          <ThemeToggleContainer label={tApp('theme.label')} options={buildThemeOptions(tApp)} />
        }
        footerNote={tApp('footerNote')}
        footerLinks={<SiteFooterNav columns={buildSiteFooterLinks(tApp)} />}
      >
        <LandingHero
          eyebrow={t('eyebrow')}
          title={t('title')}
          lead={t('lead')}
          supporting={t('supporting')}
          primaryAction={
            <AppLink
              href={ROUTE_PATHS.signUp}
              className={buttonVariants({ variant: 'primary', size: 'lg' })}
            >
              {t('primaryCta')}
            </AppLink>
          }
          secondaryAction={
            <AppLink
              href={ROUTE_PATHS.signIn}
              className={buttonVariants({ variant: 'secondary', size: 'lg' })}
            >
              {t('secondaryCta')}
            </AppLink>
          }
          aside={
            <ManifestPanel
              ariaLabel={t('principlesTitle')}
              rows={principles.map((principle) => ({
                id: principle.id,
                label: principle.id,
                value: principle.title,
              }))}
            />
          }
        />

        <div className={sectionClasses.page}>
          <Section
            headingId="how-it-works"
            eyebrow={t('eyebrow')}
            title={t('howTitle')}
            lead={t('howLead')}
          >
            <LandingStepList steps={steps} />
          </Section>

          <Section headingId="principles" eyebrow={t('eyebrow')} title={t('principlesTitle')}>
            <LandingPrincipleList principles={principles} />
          </Section>

          <Section
            headingId="explore"
            eyebrow={t('landing.directory.eyebrow')}
            title={t('landing.directory.title')}
            lead={t('landing.directory.lead')}
          >
            <LandingDirectory items={directory} linkLabel={t('landing.directory.linkLabel')} />
          </Section>

          <Section
            headingId="use-cases"
            eyebrow={t('landing.useCases.eyebrow')}
            title={t('landing.useCases.title')}
            lead={t('landing.useCases.lead')}
          >
            <LandingPrincipleList principles={useCases} />
          </Section>

          <Section
            headingId="trust-boundaries"
            eyebrow={t('landing.trust.eyebrow')}
            title={t('landing.trust.title')}
            lead={t('landing.trust.lead')}
          >
            <LandingPrincipleList principles={trustDetails} />
          </Section>

          <Section
            headingId="common-questions"
            eyebrow={t('landing.faq.eyebrow')}
            title={t('landing.faq.title')}
            lead={t('landing.faq.lead')}
          >
            <LandingFaq items={faq} />
          </Section>

          <LandingCta
            title={t('landing.cta.title')}
            description={t('landing.cta.description')}
            actions={
              <>
                <AppLink
                  href={ROUTE_PATHS.signUp}
                  className={buttonVariants({ variant: 'primary', size: 'lg' })}
                >
                  {t('primaryCta')}
                </AppLink>
                <AppLink
                  href={toAppRoute('/how-it-works')}
                  className={buttonVariants({ variant: 'secondary', size: 'lg' })}
                >
                  {t('landing.cta.learnMore')}
                </AppLink>
              </>
            }
          />
        </div>
      </SiteShell>
    </>
  );
}
