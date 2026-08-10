import {
  BILLING_DEACTIVATION_BATCH_SIZE,
  BILLING_NO_STORE_HEADERS,
  isAuthorizedBillingCronRequest,
} from '@/modules/payments';
import { deactivateExpiredTrialPortfolios } from '@/modules/payments/server';
import { getServerEnv } from '@/packages/env/server';

export const dynamic = 'force-dynamic';

/**
 * Scheduled trial-expiry sweep — see `vercel.json` and
 * `docs/deployment.md#scheduled-billing-deactivation`.
 *
 * Same shape as `/api/operations/asset-deletions`: a bearer secret Vercel
 * Cron supplies as `Authorization`, no caching, and a response that carries
 * only a count — never which portfolios or owners were affected.
 */
export async function GET(request: Request): Promise<Response> {
  const env = getServerEnv();

  if (!isAuthorizedBillingCronRequest(request.headers.get('authorization'), env.CRON_SECRET)) {
    return Response.json(
      { error: 'unauthorized' },
      { status: 401, headers: BILLING_NO_STORE_HEADERS },
    );
  }

  const deactivated = await deactivateExpiredTrialPortfolios(
    new Date(),
    BILLING_DEACTIVATION_BATCH_SIZE,
  );

  return Response.json({ deactivated }, { headers: BILLING_NO_STORE_HEADERS });
}
