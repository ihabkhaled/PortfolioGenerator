import type { PortfolioStatusTone } from '../types/dashboard.types';
import type { PortfolioStatus } from '../types/portfolio.types';

export const PORTFOLIO_STATUS_TONES: Readonly<Record<PortfolioStatus, PortfolioStatusTone>> = {
  DRAFT: 'neutral',
  PUBLISHED: 'success',
  UNPUBLISHED: 'warning',
};

export const PORTFOLIO_STATUS_MESSAGE_KEYS: Readonly<Record<PortfolioStatus, string>> = {
  DRAFT: 'status.draft',
  PUBLISHED: 'status.published',
  UNPUBLISHED: 'status.unpublished',
};
