/**
 * Account UI surface.
 *
 * Separate from `index.ts` so the settings route can mount the destructive
 * controls without the barrel dragging the deletion service — and through it
 * the database client and the object store — into the client bundle.
 */

export { AccountSummary } from './components/account-summary.component';
export { accountClasses } from './constants/account-style.constants';
export { DeleteAccountContainer } from './containers/delete-account.container';
export { DeletePortfolioContainer } from './containers/delete-portfolio.container';
export { AccountPreferencesContainer } from './containers/account-preferences.container';
export { AccountProfileContainer } from './containers/account-profile.container';
export { AccountSecurityContainer } from './containers/account-security.container';
