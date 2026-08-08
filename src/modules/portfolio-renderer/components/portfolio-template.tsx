import type { ReactElement } from 'react';

import { AppLink, toAppRoute } from '@/packages/link';
import { cn } from '@/packages/ui-primitives';
import { Section } from '@/shared/components/data-display/section.component';
import { sectionClasses } from '@/shared/components/data-display/section.variants';

import { portfolioShellClasses } from '../constants/template-style.constants';
import { hasContent } from '../helpers/section-content.helper';
import type { PortfolioTemplateProps } from '../types/renderer.types';

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
  const renderable = props.sections.filter((section) => hasContent(section, props.document));
  const heroSection = renderable.find((section) => section.type === 'hero');
  const bandSections = renderable.filter((section) => section.type !== 'hero');

  return (
    <PortfolioShell
      displayName={props.document.identity.displayName}
      headline={props.document.identity.headline}
      navigationLabel={props.labels.navigationLabel}
      footerNote={props.labels.builtWith}
      banner={null}
      navigation={props.navigation.map((item) => (
        <AppLink
          key={item.pageId}
          href={toAppRoute(item.href)}
          aria-current={item.isCurrent ? 'page' : undefined}
          className={cn(
            portfolioShellClasses.navLink,
            item.isCurrent ? portfolioShellClasses.navLinkCurrent : undefined,
          )}
        >
          {item.label}
        </AppLink>
      ))}
    >
      {heroSection === undefined ? null : (
        <SectionRenderer section={heroSection} document={props.document} labels={props.labels} />
      )}

      <div className={sectionClasses.page}>
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
            <SectionRenderer section={section} document={props.document} labels={props.labels} />
          </Section>
        ))}
      </div>
    </PortfolioShell>
  );
}
