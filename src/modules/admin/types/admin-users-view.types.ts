import type { ReactNode } from 'react';

import type { AdminUserStatus } from './admin.types';

/**
 * A safe subset of `BadgeVariantProps['tone']` (see `@/packages/ui-primitives`)
 * rather than importing that type directly: every value here is a valid tone,
 * so the subset is assignable wherever the full union is expected, without a
 * view-layer file reaching into a design-system package type.
 */
export type AdminBadgeTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface AdminStatusBadgeView {
  readonly label: string;
  readonly tone: AdminBadgeTone;
}

/** One row of the users list, fully resolved for display — no ids to translate, no dates to format. */
export interface AdminUserRowView {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly verifiedLabel: string;
  /** The raw status alongside its badge — the page needs this to tell the row's status-toggle container which direction to offer. */
  readonly status: AdminUserStatus;
  readonly statusBadge: AdminStatusBadgeView;
  readonly portfolioCountLabel: string;
  readonly joinedLabel: string;
  readonly detailHref: string;
}

/** A row plus its action controls — the controls are containers, so they arrive as a prop rather than being built in the pure view helper. */
export interface AdminUserListItemView extends AdminUserRowView {
  readonly actions: ReactNode;
}

export interface AdminUsersTableColumnLabels {
  readonly name: string;
  readonly email: string;
  readonly verified: string;
  readonly status: string;
  readonly portfolios: string;
  readonly joined: string;
  readonly actions: string;
}

export interface AdminUsersTableProps {
  readonly items: readonly AdminUserListItemView[];
  readonly columnLabels: AdminUsersTableColumnLabels;
}

export interface AdminUserSearchFormProps {
  readonly action: string;
  readonly queryParamName: string;
  readonly pageParamName: string;
  readonly queryValue: string;
  readonly label: string;
  readonly placeholder: string;
  readonly submitLabel: string;
}

/** `prevHref`/`nextHref` are `null` at the respective boundary — the component renders a disabled control rather than a dead link. */
export interface AdminUsersPaginationProps {
  readonly statusLabel: string;
  readonly prevHref: string | null;
  readonly nextHref: string | null;
  readonly prevLabel: string;
  readonly nextLabel: string;
}

/** The pure, translatable half of the profile card — what the view helper can build without a container in hand. */
export interface AdminUserProfileFieldsView {
  readonly nameLabel: string;
  readonly name: string;
  readonly emailLabel: string;
  readonly email: string;
  readonly verifiedLabel: string;
  readonly verifiedValue: string;
  readonly statusLabel: string;
  readonly statusBadge: AdminStatusBadgeView;
  readonly joinedLabel: string;
  readonly joinedValue: string;
}

export interface AdminUserDetailProfileProps extends AdminUserProfileFieldsView {
  /** The suspend/activate control for this user, composed upstream — a container, not a pure value. */
  readonly statusAction: ReactNode;
  /** The "send password reset" control for this user. */
  readonly resetPasswordAction: ReactNode;
}

/** One portfolio row on a user's detail page. */
export interface AdminUserPortfolioRowView {
  readonly id: string;
  readonly slug: string;
  readonly statusBadge: AdminStatusBadgeView;
  /** `null` when the portfolio is not suspended — the component renders nothing rather than a "not suspended" badge. */
  readonly suspendedBadge: AdminStatusBadgeView | null;
  readonly updatedLabel: string;
  readonly publicHref: string;
  readonly publicLabel: string;
  readonly adminPortfoliosHref: string;
  readonly adminPortfoliosLabel: string;
}

export interface AdminUserPortfoliosColumnLabels {
  readonly slug: string;
  readonly status: string;
  readonly updated: string;
  readonly links: string;
}

export interface AdminUserPortfoliosTableProps {
  readonly items: readonly AdminUserPortfolioRowView[];
  readonly columnLabels: AdminUserPortfoliosColumnLabels;
}
