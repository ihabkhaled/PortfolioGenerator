import type { ReactElement } from 'react';

import type { PortfolioCustomBlock, PortfolioDocument } from '@/modules/portfolio-document';
import { AppImage } from '@/packages/image';
import { ManifestPanel } from '@/shared/components/data-display/manifest-panel.component';
import { ExternalLink } from '@/shared/components/primitives/external-link';
import type { ManifestRow } from '@/shared/components/types/shared-component.types';
import { toDisplayUrl } from '@/shared/utils/safe-url.util';

import {
  contactClasses,
  customBlockClasses,
  factListClasses,
  heroClasses,
  projectClasses,
} from '../constants/template-style.constants';
import {
  buildCertificationEntries,
  buildEducationEntries,
  buildExperienceEntries,
  buildLanguageEntries,
  joinNonEmpty,
  splitParagraphs,
  visibleLinks,
} from '../helpers/section-content.helper';
import type { FactEntry, SectionRendererProps } from '../types/renderer.types';
import type { ContactRow } from '../types/section-props.types';

import { AboutSection } from './about-section.component';
import { ContactSection } from './contact-section.component';
import { CustomSection } from './custom-section.component';
import { FactListSection } from './fact-list-section.component';
import { HeroSection } from './hero-section.component';
import { ProjectsSection } from './projects-section.component';
import { SkillsSection } from './skills-section.component';
import { TimelineSection } from './timeline-section.component';

/**
 * The section registry.
 *
 * Not a `*.component.tsx` on purpose: this file's job is dispatch and view-model
 * assembly, and the TSX-only rule exists precisely so that work does not leak
 * into leaf components. Everything below it is a pure presentational component
 * that receives finished strings.
 *
 * An unknown section type returns null rather than throwing. A published
 * portfolio written by a newer build must degrade to "one band missing", never
 * to a blank page.
 */
export function SectionRenderer(props: Readonly<SectionRendererProps>): ReactElement | null {
  const { section, document, labels } = props;

  switch (section.type) {
    case 'hero': {
      return (
        <HeroSection
          displayName={document.identity.displayName}
          headline={document.identity.headline}
          summary={document.identity.summary}
          availabilityLabel={
            section.config.showAvailability && document.identity.availabilityEnabled
              ? labels.availability
              : null
          }
          portrait={renderPortrait(section.config.showPortrait, document, labels.portraitAlt)}
          links={renderSocialLinks(document)}
          aside={renderHeroAside(document, labels)}
        />
      );
    }

    case 'about': {
      return <AboutSection paragraphs={splitParagraphs(document.identity.summary ?? '')} />;
    }

    case 'experience': {
      return (
        <TimelineSection
          entries={buildExperienceEntries(document, section.config.limit, labels.present)}
        />
      );
    }

    case 'projects': {
      return <ProjectsSection projects={buildProjectEntries(document, section.config.limit)} />;
    }

    case 'skills': {
      return <SkillsSection groups={document.skills.filter((group) => group.items.length > 0)} />;
    }

    case 'education': {
      return (
        <FactListSection entries={buildEducationEntries(document)} renderLink={renderFactLink} />
      );
    }

    case 'certifications': {
      return (
        <FactListSection
          entries={buildCertificationEntries(document)}
          renderLink={renderFactLink}
        />
      );
    }

    case 'languages': {
      return (
        <FactListSection entries={buildLanguageEntries(document)} renderLink={renderFactLink} />
      );
    }

    case 'contact': {
      return (
        <ContactSection
          rows={buildContactRows(section.config, document, labels)}
          links={section.config.showLinks ? renderSocialLinks(document) : null}
        />
      );
    }

    case 'custom': {
      return (
        <CustomSection blocks={section.config.blocks} renderLinkBlock={renderCustomLinkBlock} />
      );
    }
  }
}

function renderPortrait(
  showPortrait: boolean,
  document: PortfolioDocument,
  alt: string,
): ReactElement | null {
  if (!showPortrait || document.identity.portraitAssetId === null) {
    return null;
  }

  return (
    <div className={heroClasses.portraitFrame}>
      <AppImage
        src={`/api/assets/${document.identity.portraitAssetId}`}
        alt={alt}
        width={112}
        height={112}
        className={heroClasses.portrait}
        priority
      />
    </div>
  );
}

/**
 * The hero's evidence column: the facts a reader wants within two seconds.
 * Rows are omitted rather than rendered empty, so a portfolio with no location
 * does not advertise the gap.
 */
function renderHeroAside(
  document: PortfolioDocument,
  labels: SectionRendererProps['labels'],
): ReactElement | null {
  const rows: ManifestRow[] = [];

  if (document.identity.location !== null) {
    rows.push({
      id: 'location',
      label: labels.locationLabel,
      value: document.identity.location,
    });
  }

  if (document.contact.email.visible && document.contact.email.value !== null) {
    rows.push({ id: 'email', label: labels.emailLabel, value: document.contact.email.value });
  }

  if (rows.length === 0) {
    return null;
  }

  return <ManifestPanel rows={rows} ariaLabel={labels.contactCta} />;
}

function renderSocialLinks(document: PortfolioDocument): ReactElement {
  return (
    <>
      {visibleLinks(document).map((link) => (
        <ExternalLink key={link.id} href={link.url} className={heroClasses.socialLink}>
          {link.label}
        </ExternalLink>
      ))}
    </>
  );
}

function renderFactLink(entry: FactEntry): ReactElement | null {
  if (entry.link === null) {
    return null;
  }

  return (
    <ExternalLink href={entry.link} className={factListClasses.link}>
      {toDisplayUrl(entry.link)}
    </ExternalLink>
  );
}

function renderCustomLinkBlock(block: PortfolioCustomBlock): ReactElement | null {
  if (block.kind !== 'links') {
    return null;
  }

  return (
    <>
      {block.items.map((link) => (
        <ExternalLink key={link.id} href={link.url} className={customBlockClasses.link}>
          {link.label}
        </ExternalLink>
      ))}
    </>
  );
}

function buildProjectEntries(
  document: PortfolioDocument,
  limit: number | null,
): readonly {
  id: string;
  name: string;
  summary: string | null;
  highlights: readonly string[];
  technologies: readonly string[];
  links: ReactElement;
}[] {
  const projects = limit === null ? document.projects : document.projects.slice(0, limit);

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    summary: project.summary,
    highlights: project.highlights,
    technologies: project.technologies,
    links: (
      <>
        {project.links
          .filter((link) => link.visible)
          .map((link) => (
            <ExternalLink key={link.id} href={link.url} className={projectClasses.link}>
              {link.label}
            </ExternalLink>
          ))}
      </>
    ),
  }));
}

function buildContactRows(
  config: { showEmail: boolean; showPhone: boolean; showLinks: boolean },
  document: PortfolioDocument,
  labels: SectionRendererProps['labels'],
): readonly ContactRow[] {
  const rows: ContactRow[] = [];

  if (config.showEmail && document.contact.email.visible && document.contact.email.value !== null) {
    rows.push({
      id: 'email',
      label: labels.emailLabel,
      value: (
        <ExternalLink
          href={`mailto:${document.contact.email.value}`}
          className={contactClasses.link}
        >
          {document.contact.email.value}
        </ExternalLink>
      ),
    });
  }

  if (config.showPhone && document.contact.phone.visible && document.contact.phone.value !== null) {
    rows.push({ id: 'phone', label: labels.phoneLabel, value: document.contact.phone.value });
  }

  const location = joinNonEmpty([document.identity.location], '');

  if (location !== null) {
    rows.push({ id: 'location', label: labels.locationLabel, value: location });
  }

  return rows;
}
