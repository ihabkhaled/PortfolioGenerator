/**
 * Client-safe UI surface of the payments module.
 *
 * Separate from `index.ts` so a page mounting the checkout button does not
 * have to reach into `containers/`/`components/` directly — reaching into
 * another module's internals is what the module-boundary lint rule forbids —
 * and separate from `server.ts` so none of this drags the database client or
 * the PayPal HTTP client into the browser bundle.
 */

export { BillingStatusBanner } from './components/billing-status-banner.component';
export { paymentsClasses } from './constants/payments-style.constants';
export { PaypalCheckoutContainer } from './containers/paypal-checkout.container';
