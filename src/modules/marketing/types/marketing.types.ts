import type { ReactNode } from 'react';

import type { Route } from '@/packages/navigation';
import type { MarketingRouteSlug } from '@/shared/constants/route-paths.constants';

export interface LandingHeroProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly supporting: string;
  readonly primaryAction: ReactNode;
  readonly secondaryAction: ReactNode;
  readonly aside: ReactNode;
}

export interface LandingStep {
  readonly id: string;
  readonly index: string;
  readonly title: string;
  readonly description: string;
}

export interface LandingStepListProps {
  readonly steps: readonly LandingStep[];
}

export interface LandingPrinciple {
  readonly id: string;
  readonly title: string;
  readonly description: string;
}

export interface LandingPrincipleListProps {
  readonly principles: readonly LandingPrinciple[];
}

export interface MarketingPageDefinition {
  readonly slug: MarketingRouteSlug;
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly sections: readonly [string, string, string];
  readonly relatedSlugs: readonly [MarketingRouteSlug, MarketingRouteSlug];
}

export interface MarketingTopicPageProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly sections: readonly string[];
  readonly related: ReactNode;
}

export interface LandingDirectoryItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly href: Route;
}

export interface LandingDirectoryProps {
  readonly items: readonly LandingDirectoryItem[];
  readonly linkLabel: string;
}

export interface LandingFaqItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

export interface LandingFaqProps {
  readonly items: readonly LandingFaqItem[];
}

export interface LandingCtaProps {
  readonly title: string;
  readonly description: string;
  readonly actions: ReactNode;
}
