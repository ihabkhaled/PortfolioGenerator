import type { ReactNode } from 'react';

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
