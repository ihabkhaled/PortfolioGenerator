import type { ReactNode } from 'react';

import type { BadgeVariantProps } from '@/packages/ui-primitives';

export type AdminPortfolioBadgeTone = NonNullable<BadgeVariantProps['tone']>;

/** One table row's translated, link-ready fields, before its action controls attach. */
export interface AdminPortfolioRowViewData {
  readonly id: string;
  readonly slug: string;
  readonly portfolioHref: string;
  readonly ownerId: string;
  readonly ownerEmail: string;
  readonly ownerHref: string;
  readonly statusLabel: string;
  readonly statusTone: AdminPortfolioBadgeTone;
  readonly isSuspended: boolean;
  readonly suspendedLabel: string;
  readonly suspendedTone: AdminPortfolioBadgeTone;
  readonly updatedAtLabel: string;
}

export interface AdminPortfolioTableRowView extends AdminPortfolioRowViewData {
  readonly actions: ReactNode;
}

export interface AdminPortfolioTableColumnLabels {
  readonly slug: string;
  readonly owner: string;
  readonly status: string;
  readonly suspended: string;
  readonly updated: string;
  readonly actions: string;
}

export interface AdminPortfolioTableProps {
  readonly rows: readonly AdminPortfolioTableRowView[];
  readonly columnLabels: AdminPortfolioTableColumnLabels;
}

export interface AdminPortfolioFilterOption {
  readonly value: string;
  readonly label: string;
}

export interface AdminPortfolioFiltersProps {
  readonly action: string;
  readonly queryFieldName: string;
  readonly query: string;
  readonly searchLabel: string;
  readonly searchPlaceholder: string;
  readonly statusFieldName: string;
  readonly status: string;
  readonly statusLabel: string;
  readonly statusOptions: readonly AdminPortfolioFilterOption[];
  readonly submitLabel: string;
}

export interface AdminPaginationProps {
  readonly summaryLabel: string;
  readonly previousLabel: string;
  readonly previousHref: string | null;
  readonly nextLabel: string;
  readonly nextHref: string | null;
}

export interface AdminPortfolioSuspendToggleProps {
  readonly portfolioId: string;
  readonly isSuspended: boolean;
}

export interface AdminPortfolioDeleteProps {
  readonly portfolioId: string;
}
