import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import {
  LandingHero,
  LandingPrincipleList,
  LandingStepList,
  type LandingPrinciple,
  type LandingStep,
} from '@/modules/marketing';
import { absoluteUrl } from '@/packages/env';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';
import { AppLink } from '@/packages/link';
import { buttonVariants } from '@/packages/ui-primitives';
import { LANDMARK_IDS } from '@/shared/accessibility/landmark-ids.constants';
import { ManifestPanel } from '@/shared/components/data-display/manifest-panel.component';
import { Section } from '@/shared/components/data-display/section.component';
import { sectionClasses } from '@/shared/components/data-display/section.variants';
import { SiteShell } from '@/shared/components/layout/site-shell.component';
import { siteShellClasses } from '@/shared/components/layout/site-shell.variants';
import { SkipLink } from '@/shared/components/primitives/skip-link.component';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import { landingClasses } from './page.variants';

export const metadata: Metadata = {
  alternates: { canonical: absoluteUrl(ROUTE_PATHS.home) },
};

export default async function LandingPage(): Promise<ReactElement> {
  const tApp = await getServerTranslations(I18N_NAMESPACES.app);
  const t = await getServerTranslations(I18N_NAMESPACES.marketing);

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

  return (
    <>
      <SkipLink targetHref={`#${LANDMARK_IDS.mainContent}`} label={tApp('skipToContent')} />
      <SiteShell
        navigationLabel={tApp('name')}
        brand={
          <AppLink href={ROUTE_PATHS.home} className={landingClasses.brandLink}>
            <span className={siteShellClasses.brandName}>{tApp('name')}</span>
            <span className={siteShellClasses.brandRole}>{tApp('tagline')}</span>
          </AppLink>
        }
        navigation={
          <>
            <AppLink href={ROUTE_PATHS.signIn} className={siteShellClasses.navLink}>
              {tApp('nav.signIn')}
            </AppLink>
            <AppLink
              href={ROUTE_PATHS.signUp}
              className={buttonVariants({ variant: 'primary', size: 'sm' })}
            >
              {tApp('nav.signUp')}
            </AppLink>
          </>
        }
        footerNote={tApp('footerNote')}
        footerLinks={
          <>
            <AppLink href={ROUTE_PATHS.signIn} className={siteShellClasses.footerLink}>
              {tApp('nav.signIn')}
            </AppLink>
            <AppLink href={ROUTE_PATHS.signUp} className={siteShellClasses.footerLink}>
              {tApp('nav.signUp')}
            </AppLink>
          </>
        }
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
        </div>
      </SiteShell>
    </>
  );
}
