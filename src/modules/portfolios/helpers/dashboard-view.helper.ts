import {
  PORTFOLIO_STATUS_MESSAGE_KEYS,
  PORTFOLIO_STATUS_TONES,
} from '../constants/dashboard.constants';
import type { DashboardListItem } from '../types/dashboard.types';
import type { PortfolioSummary } from '../types/portfolio.types';

/**
 * Summary rows to view models.
 *
 * A portfolio whose draft has no display name yet falls back to its slug: the
 * row must stay identifiable and clickable, because an unnamed draft is
 * exactly the state a user needs to get back into.
 */
export function buildPortfolioListItems(
  portfolios: readonly PortfolioSummary[],
  translate: (key: string, values?: Record<string, string | number>) => string,
): readonly DashboardListItem[] {
  return portfolios.map((portfolio) => ({
    id: portfolio.id,
    slug: portfolio.slug,
    title: portfolio.displayName.trim() === '' ? portfolio.slug : portfolio.displayName,
    meta:
      portfolio.publishedAt === null
        ? translate('meta.neverPublished')
        : translate('meta.published', { when: formatIsoDate(portfolio.publishedAt) }),
    statusLabel: translate(PORTFOLIO_STATUS_MESSAGE_KEYS[portfolio.status]),
    statusTone: PORTFOLIO_STATUS_TONES[portfolio.status],
    isPublished: portfolio.status === 'PUBLISHED',
  }));
}

/** `YYYY-MM-DD`, stable across server and client so hydration cannot mismatch. */
export function formatIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}
