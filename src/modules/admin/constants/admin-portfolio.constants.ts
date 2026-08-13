import type { AdminPortfolioBadgeTone } from '../types/admin-portfolio-view.types';
import type {
  AdminPortfolioActionState,
  AdminPortfolioStatus,
  AdminPortfolioStatusFilter,
} from '../types/admin-portfolio.types';

/** Rows per page. Small enough that a moderator scans a page at a glance. */
export const ADMIN_PORTFOLIO_PAGE_SIZE = 20;

export const ADMIN_PORTFOLIO_STATUS_FILTERS: readonly AdminPortfolioStatusFilter[] = [
  'ALL',
  'PUBLISHED',
  'DRAFT',
  'UNPUBLISHED',
  'SUSPENDED',
];

export const ADMIN_PORTFOLIO_STATUS_FILTER_MESSAGE_KEYS: Readonly<
  Record<AdminPortfolioStatusFilter, string>
> = {
  ALL: 'portfolios.filters.all',
  PUBLISHED: 'portfolios.status.published',
  DRAFT: 'portfolios.status.draft',
  UNPUBLISHED: 'portfolios.status.unpublished',
  SUSPENDED: 'portfolios.status.suspended',
};

export const ADMIN_PORTFOLIO_STATUS_TONES: Readonly<
  Record<AdminPortfolioStatus, AdminPortfolioBadgeTone>
> = {
  DRAFT: 'neutral',
  PUBLISHED: 'success',
  UNPUBLISHED: 'warning',
};

export const ADMIN_PORTFOLIO_ACTION_STATE_INITIAL: AdminPortfolioActionState = {
  status: 'idle',
  error: null,
};

/**
 * Message keys under the `admin` i18n namespace, resolved to translated text
 * by whichever container calls the action — actions run on the server and
 * never resolve copy directly, mirroring `ADMIN_ACCOUNT_ERROR_KEYS`.
 */
export const ADMIN_PORTFOLIO_ERROR_KEYS = {
  notFound: 'portfolios.errors.notFound',
  unknown: 'portfolios.errors.unknown',
} as const;

/** Form field names shared by the suspend/activate and delete actions and their containers. */
export const ADMIN_PORTFOLIO_FIELD_NAMES = {
  portfolioId: 'portfolioId',
  suspend: 'suspend',
} as const;

/** Query-string parameter names the list page reads and the pagination/filter links write. */
export const ADMIN_PORTFOLIO_QUERY_PARAMS = {
  query: 'q',
  status: 'status',
  page: 'page',
} as const;

/** Upper bound on a submitted search term — generous for an email address, not unbounded. */
export const ADMIN_PORTFOLIO_QUERY_MAX_LENGTH = 200;

/**
 * The table's header-cell `scope`. A named constant rather than a literal in
 * the component so the value reads as HTML semantics, not copy — the same
 * reason `NON_COPY_ATTRIBUTES` exists for the attributes the lint rule
 * already knows about.
 */
export const ADMIN_PORTFOLIO_TABLE_HEAD_SCOPE = 'col';
