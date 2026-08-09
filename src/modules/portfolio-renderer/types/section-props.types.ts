import type { ReactNode } from 'react';

import type {
  PortfolioCustomBlock,
  PortfolioNavigationItem,
  PortfolioSkillGroup,
} from '@/modules/portfolio-document';

import type { FactEntry, TimelineEntry } from './renderer.types';

export type PortfolioCustomLinkBlock = Extract<PortfolioCustomBlock, { readonly kind: 'links' }>;

export interface HeroSectionProps {
  readonly displayName: string;
  readonly headline: string | null;
  readonly summary: string | null;
  readonly availabilityLabel: string | null;
  readonly portrait: ReactNode;
  readonly links: ReactNode;
  readonly aside: ReactNode;
}

export interface AboutSectionProps {
  readonly paragraphs: readonly string[];
}

export interface TimelineSectionProps {
  readonly entries: readonly TimelineEntry[];
}

export interface ProjectEntry {
  readonly id: string;
  readonly name: string;
  readonly summary: string | null;
  readonly highlights: readonly string[];
  readonly technologies: readonly string[];
  readonly links: ReactNode;
}

export interface ProjectsSectionProps {
  readonly projects: readonly ProjectEntry[];
}

export interface SkillsSectionProps {
  readonly groups: readonly PortfolioSkillGroup[];
}

export interface FactListSectionProps {
  readonly entries: readonly FactEntry[];
  readonly renderLink: (entry: FactEntry) => ReactNode;
}

export interface ContactRow {
  readonly id: string;
  readonly label: string;
  readonly value: ReactNode;
}

export interface ContactSectionProps {
  readonly rows: readonly ContactRow[];
  readonly links: ReactNode;
}

export interface CustomSectionProps {
  readonly blocks: readonly PortfolioCustomBlock[];
  readonly renderLinkBlock: (block: PortfolioCustomLinkBlock) => ReactNode;
}

export interface PortfolioShellProps {
  readonly displayName: string;
  readonly headline: string | null;
  readonly navigation: ReactNode;
  readonly navigationLabel: string;
  /** Controls that belong to the reader rather than to the portfolio. */
  readonly actions: ReactNode;
  readonly footerNote: string;
  readonly footerLinks: ReactNode;
  readonly banner: ReactNode;
  readonly children: ReactNode;
}

export interface PortfolioNavProps {
  readonly label: string;
  readonly items: readonly PortfolioNavigationItem[];
}

export interface SupplementalSectionProps {
  readonly title: string;
  readonly children: ReactNode;
}
