import type { ReactNode } from 'react';

export type PortfolioStatusTone = 'neutral' | 'brand' | 'success' | 'warning';

export interface PortfolioListItem {
  readonly id: string;
  readonly title: string;
  readonly meta: string;
  readonly statusLabel: string;
  readonly statusTone: PortfolioStatusTone;
  readonly actions: ReactNode;
}

export interface PortfolioListProps {
  readonly items: readonly PortfolioListItem[];
}

/** A list row before its action links are attached by the route. */
export interface DashboardListItem {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly meta: string;
  readonly statusLabel: string;
  readonly statusTone: PortfolioStatusTone;
  readonly isPublished: boolean;
}

export interface CreatePortfolioFormLabels {
  readonly nameLabel: string;
  readonly namePlaceholder: string;
  readonly slugLabel: string;
  readonly slugHint: string;
  readonly submit: string;
  readonly pending: string;
}
