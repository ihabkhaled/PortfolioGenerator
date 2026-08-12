import type { ReactElement } from 'react';

import { AppLink } from '@/packages/link';
import { Section } from '@/shared/components/data-display/section.component';
import { buildPublicAssetPath, ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import {
  portfolioSectionClasses,
  portfolioShellClasses,
} from '../constants/template-style.constants';
import { PortfolioNavMenuContainer } from '../containers/portfolio-nav-menu.container';
import { hasContent } from '../helpers/section-content.helper';
import type { PortfolioTemplateProps } from '../types/renderer.types';

import { PortfolioNav } from './portfolio-nav.component';
import { PortfolioShell } from './portfolio-shell.component';
import { SectionRenderer } from './section-renderer';

/**
 * `reference-classic-v1`.
 *
 * The renderer knows nothing about any particular person: it takes a validated
 * document and a resolved page, and draws them. No component below this file
 * imports a constant describing a tenant, which is the property that makes one
 * template serve every portfolio.
 *
 * The hero is rendered outside the section rail because it is the page's
 * masthead, not one band among several.
 */
export function PortfolioTemplate(props: Readonly<PortfolioTemplateProps>): ReactElement {
  const buildAssetPath = props.buildAssetPath ?? buildPublicAssetPath;
  const renderable = props.sections.filter((section) => hasContent(section, props.document));
  const heroSection = renderable.find((section) => section.type === 'hero');
  const bandSections = renderable.filter((section) => section.type !== 'hero');

  return (
    <PortfolioShell
      displayName={props.document.identity.displayName}
      headline={props.document.identity.headline}
      navigationLabel={props.labels.navigationLabel}
      homeLabel={props.labels.homeLabel}
      platformName={props.labels.platformName}
      footerNote={
        <AppLink href={ROUTE_PATHS.home} className={portfolioShellClasses.footerNoteLink}>
          {props.labels.builtWith}
        </AppLink>
      }
      banner={null}
      isPreview={props.isPreview}
      navigation={<PortfolioNav label={props.labels.navigationLabel} items={props.navigation} />}
      mobileMenu={
        <PortfolioNavMenuContainer
          items={props.navigation}
          navigationLabel={props.labels.navigationLabel}
          toggleLabel={props.labels.menuToggleLabel}
          actions={props.actions}
        />
      }
      actions={props.actions}
      footerLinks={props.footerLinks}
    >
      {heroSection === undefined ? null : (
        <SectionRenderer
          section={heroSection}
          document={props.document}
          labels={props.labels}
          buildAssetPath={buildAssetPath}
        />
      )}

      <div className={portfolioSectionClasses.page} data-testid="portfolio-section-page">
        {bandSections.map((section) => (
          <Section
            key={section.id}
            headingId={`section-${section.id}`}
            eyebrow={props.labels.sections[section.type]}
            title={
              'title' in section.config && section.config.title !== null
                ? section.config.title
                : props.labels.sections[section.type]
            }
          >
            <SectionRenderer
              section={section}
              document={props.document}
              labels={props.labels}
              buildAssetPath={buildAssetPath}
            />
          </Section>
        ))}
      </div>
    </PortfolioShell>
  );
}
