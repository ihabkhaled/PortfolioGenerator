import type { ReactNode } from 'react';

import type {
  PortfolioDocument,
  PortfolioNavigationItem,
  PortfolioSection,
} from '@/modules/portfolio-document';

/**
 * Every string the template renders that is *not* tenant content.
 *
 * Passing them in rather than resolving them inside the template keeps the
 * renderer free of message keys, which is what allows a portfolio to be
 * rendered in a test with plain fixtures and, later, in the tenant's own
 * content language without touching a component.
 */
export interface PortfolioLabels {
  readonly sections: Readonly<Record<PortfolioSection['type'], string>>;
  readonly present: string;
  readonly emailLabel: string;
  readonly phoneLabel: string;
  readonly locationLabel: string;
  readonly availability: string;
  readonly contactCta: string;
  readonly skipToContent: string;
  readonly builtWith: string;
  readonly navigationLabel: string;
  readonly portraitAlt: string;
  readonly galleryClose: string;
  readonly supplemental: Readonly<{
    softSkills: string;
    courses: string;
    publications: string;
    volunteering: string;
    awards: string;
    interests: string;
    testimonials: string;
    gallery: string;
    attachments: string;
  }>;
}

export interface PortfolioTemplateProps {
  readonly document: PortfolioDocument;
  readonly sections: readonly PortfolioSection[];
  readonly navigation: readonly PortfolioNavigationItem[];
  readonly labels: PortfolioLabels;
  readonly portfolioSlug: string;
  readonly pageTitle: string;
  /** Draft previews render the same markup with a banner and no indexing. */
  readonly isPreview: boolean;
  /** Reader-owned controls — the theme switch, and later the locale switch. */
  readonly actions: ReactNode;
  /** Social profiles and the CV download, rendered in the footer. */
  readonly footerLinks: ReactNode;
  readonly buildAssetPath?: (assetId: string) => string;
}

export interface SectionRendererProps {
  readonly section: PortfolioSection;
  readonly document: PortfolioDocument;
  readonly labels: PortfolioLabels;
  readonly buildAssetPath?: (assetId: string) => string;
}

export interface TimelineEntry {
  readonly id: string;
  readonly organization: string;
  readonly role: string;
  readonly dateRange: string;
  readonly summary: string | null;
  readonly highlights: readonly string[];
  readonly tags: readonly string[];
}

export interface FactEntry {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string | null;
  readonly meta: string | null;
  readonly detail: string | null;
  readonly link: string | null;
}
