import { HEALTH_CACHE_CONTROL, toHttpStatus } from '@/modules/admin-health';
import { checkHealth } from '@/modules/admin-health/server';

/**
 * Readiness probe.
 *
 * Unauthenticated because a load balancer has to reach it, and therefore
 * deliberately uninformative: a state per check and a latency, no version, no
 * commit, no error text. Never cached — a cached health response is a stale
 * claim that an instance is serving.
 */
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const report = await checkHealth();

  return Response.json(report, {
    status: toHttpStatus(report.state),
    headers: { 'Cache-Control': HEALTH_CACHE_CONTROL },
  });
}
