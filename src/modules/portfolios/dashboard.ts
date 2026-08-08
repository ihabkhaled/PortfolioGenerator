/**
 * Dashboard-facing surface of the portfolios module.
 *
 * Separate from `index.ts` (types only) and `server.ts` (database access) so a
 * page can import the UI pieces without either pulling the Prisma client into a
 * client bundle or exposing repository functions to code that has no owner id.
 */

export { PortfolioList } from './components/portfolio-list.component';
export { dashboardClasses } from './constants/dashboard-style.constants';
export { PORTFOLIO_MAX_PER_OWNER } from './constants/portfolio.constants';
export { CreatePortfolioFormContainer } from './containers/create-portfolio-form.container';
export { buildPortfolioListItems, formatIsoDate } from './helpers/dashboard-view.helper';
export type {
  CreatePortfolioFormLabels,
  DashboardListItem,
  PortfolioListItem,
  PortfolioStatusTone,
} from './types/dashboard.types';
