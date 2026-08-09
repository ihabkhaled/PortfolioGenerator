import type { ReactElement } from 'react';

import type { PortfolioDocument } from '@/modules/portfolio-document';
import {
  CameraIcon,
  CodeIcon,
  GlobeIcon,
  MessageIcon,
  VideoIcon,
  type AppIcon,
} from '@/packages/icons';
import { AppImage } from '@/packages/image';
import { AppLink, toAppRoute } from '@/packages/link';
import { ManifestPanel } from '@/shared/components/data-display/manifest-panel.component';
import { ExternalLink } from '@/shared/components/primitives/external-link';
import type { ManifestRow } from '@/shared/components/types/shared-component.types';
import { buildPublicAssetPath } from '@/shared/constants/route-paths.constants';
import { formatPhoneNumber } from '@/shared/utils/phone-number.util';
import { toDisplayUrl } from '@/shared/utils/safe-url.util';

import {
  contactClasses,
  customBlockClasses,
  factListClasses,
  heroClasses,
  projectClasses,
  supplementalClasses,
} from '../constants/template-style.constants';
import {
  buildCertificationEntries,
  buildAwardEntries,
  buildCourseEntries,
  buildEducationEntries,
  buildExperienceEntries,
  buildLanguageEntries,
  buildPublicationEntries,
  buildSoftSkillEntries,
  buildVolunteeringEntries,
  joinNonEmpty,
  splitParagraphs,
} from '../helpers/section-content.helper';
import type { FactEntry, SectionRendererProps } from '../types/renderer.types';
import type { ContactRow, PortfolioCustomLinkBlock } from '../types/section-props.types';

import { AboutSection } from './about-section.component';
import { ContactSection } from './contact-section.component';
import { CustomSection } from './custom-section.component';
import { FactListSection } from './fact-list-section.component';
import { HeroSection } from './hero-section.component';
import { ProjectsSection } from './projects-section.component';
import { SkillsSection } from './skills-section.component';
import { SupplementalSection } from './supplemental-section.component';
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
      return (
        <div className={supplementalClasses.stack}>
          <AboutSection paragraphs={splitParagraphs(document.identity.summary ?? '')} />
          {renderAboutCollections(document, labels)}
        </div>
      );
    }

    case 'experience': {
      return (
        <div className={supplementalClasses.stack}>
          <TimelineSection
            entries={buildExperienceEntries(document, section.config.limit, labels.present)}
          />
          {document.volunteering.length === 0 ? null : (
            <SupplementalSection title={labels.supplemental.volunteering}>
              <TimelineSection entries={buildVolunteeringEntries(document, labels.present)} />
            </SupplementalSection>
          )}
        </div>
      );
    }

    case 'projects': {
      return <ProjectsSection projects={buildProjectEntries(document, section.config.limit)} />;
    }

    case 'skills': {
      return (
        <div className={supplementalClasses.stack}>
          <SkillsSection groups={document.skills.filter((group) => group.items.length > 0)} />
          {document.softSkills.length === 0 ? null : (
            <SupplementalSection title={labels.supplemental.softSkills}>
              <FactListSection
                entries={buildSoftSkillEntries(document)}
                renderLink={renderFactLink}
              />
            </SupplementalSection>
          )}
        </div>
      );
    }

    case 'education': {
      return (
        <FactListSection entries={buildEducationEntries(document)} renderLink={renderFactLink} />
      );
    }

    case 'certifications': {
      return (
        <div className={supplementalClasses.stack}>
          <FactListSection
            entries={buildCertificationEntries(document)}
            renderLink={renderFactLink}
          />
          {document.courses.length === 0 ? null : (
            <SupplementalSection title={labels.supplemental.courses}>
              <FactListSection
                entries={buildCourseEntries(document)}
                renderLink={renderNamedFactLink}
              />
            </SupplementalSection>
          )}
        </div>
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
        src={buildPublicAssetPath(document.identity.portraitAssetId)}
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
      {document.socialLinks
        .filter((link) => link.visible)
        .map((link) => {
          const Icon = socialIcon(link.kind);
          const label = link.label ?? socialLabel(link.kind);
          return (
            <ExternalLink key={link.id} href={link.url} className={heroClasses.socialLink}>
              <Icon aria-hidden size={16} />
              {label}
            </ExternalLink>
          );
        })}
    </>
  );
}

function socialLabel(kind: PortfolioDocument['socialLinks'][number]['kind']): string {
  const labels: Record<PortfolioDocument['socialLinks'][number]['kind'], string> = {
    github: 'GitHub',
    gitlab: 'GitLab',
    behance: 'Behance',
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
    tiktok: 'TikTok',
    instagram: 'Instagram',
    facebook: 'Facebook',
    x: 'X',
    threads: 'Threads',
    dribbble: 'Dribbble',
    stackoverflow: 'Stack Overflow',
    telegram: 'Telegram',
    whatsapp: 'WhatsApp',
    medium: 'Medium',
    website: 'Website',
  };
  return labels[kind];
}

function socialIcon(kind: PortfolioDocument['socialLinks'][number]['kind']): AppIcon {
  switch (kind) {
    case 'github':
    case 'gitlab':
    case 'stackoverflow': {
      return CodeIcon;
    }
    case 'youtube':
    case 'tiktok': {
      return VideoIcon;
    }
    case 'instagram':
    case 'behance':
    case 'dribbble': {
      return CameraIcon;
    }
    case 'linkedin':
    case 'facebook':
    case 'x':
    case 'threads':
    case 'medium':
    case 'telegram':
    case 'whatsapp': {
      return MessageIcon;
    }
    case 'website': {
      return GlobeIcon;
    }
  }
}

function renderNamedFactLink(entry: FactEntry): ReactElement | null {
  if (entry.link === null) return null;
  return (
    <ExternalLink href={entry.link} className={factListClasses.link}>
      {entry.title}
    </ExternalLink>
  );
}

function renderAboutCollections(
  document: PortfolioDocument,
  labels: SectionRendererProps['labels'],
): ReactElement {
  return (
    <>
      {document.publications.length === 0 ? null : (
        <SupplementalSection title={labels.supplemental.publications}>
          <FactListSection
            entries={buildPublicationEntries(document)}
            renderLink={renderNamedFactLink}
          />
        </SupplementalSection>
      )}
      {document.awards.length === 0 ? null : (
        <SupplementalSection title={labels.supplemental.awards}>
          <FactListSection entries={buildAwardEntries(document)} renderLink={renderFactLink} />
        </SupplementalSection>
      )}
      {document.interests.length === 0 ? null : (
        <SupplementalSection title={labels.supplemental.interests}>
          <ul className={supplementalClasses.chips}>
            {document.interests.map((interest) => (
              <li key={interest} className={supplementalClasses.chip}>
                {interest}
              </li>
            ))}
          </ul>
        </SupplementalSection>
      )}
      {document.testimonials.length === 0 ? null : (
        <SupplementalSection title={labels.supplemental.testimonials}>
          <div className={supplementalClasses.quotes}>
            {document.testimonials.map((entry) => (
              <figure key={entry.id} className={supplementalClasses.quote}>
                <blockquote className={supplementalClasses.quoteText}>{entry.quote}</blockquote>
                <figcaption className={supplementalClasses.quoteByline}>
                  {joinNonEmpty([entry.author, entry.role, entry.organization], ', ')}
                </figcaption>
              </figure>
            ))}
          </div>
        </SupplementalSection>
      )}
      {document.gallery.length === 0 ? null : (
        <SupplementalSection title={labels.supplemental.gallery}>
          <div className={supplementalClasses.gallery}>
            {document.gallery.map((entry) => (
              <figure key={entry.id} className={supplementalClasses.figure}>
                <AppImage
                  src={buildPublicAssetPath(entry.assetId)}
                  alt={entry.alt}
                  width={640}
                  height={480}
                  className={supplementalClasses.galleryImage}
                />
                {entry.caption === null ? null : (
                  <figcaption className={supplementalClasses.caption}>{entry.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        </SupplementalSection>
      )}
      {document.attachments.some((entry) => entry.visible) ? (
        <SupplementalSection title={labels.supplemental.attachments}>
          <div className={supplementalClasses.attachments}>
            {document.attachments
              .filter((entry) => entry.visible)
              .map((entry) => (
                <AppLink
                  key={entry.id}
                  href={toAppRoute(buildPublicAssetPath(entry.assetId))}
                  className={supplementalClasses.attachment}
                >
                  {entry.label} ({Math.ceil(entry.sizeBytes / 1024)} KB)
                </AppLink>
              ))}
          </div>
        </SupplementalSection>
      ) : null}
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

function renderCustomLinkBlock(block: PortfolioCustomLinkBlock): ReactElement {
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

  const phone = formatPhoneNumber(
    document.contact.phone.countryIso,
    document.contact.phone.nationalNumber,
  );

  if (phone !== null && config.showPhone && document.contact.phone.visible) {
    rows.push({ id: 'phone', label: labels.phoneLabel, value: phone });
  }

  const location = joinNonEmpty([document.identity.location], '');

  if (location !== null) {
    rows.push({ id: 'location', label: labels.locationLabel, value: location });
  }

  return rows;
}
