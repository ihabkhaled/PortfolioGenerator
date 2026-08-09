import 'server-only';

import { getObjectStorage } from '@/modules/storage/server';
import {
  getClamAvVersion,
  parseClamAvSignatureDate,
  pingClamAv,
  signatureDatabaseIsFresh,
} from '@/packages/clamav';
import { getDatabase } from '@/packages/database';
import { checkConfiguredEmailTransport } from '@/packages/email/server';
import { getServerEnv } from '@/packages/env/server';
import { logger } from '@/packages/logger';

import { HEALTH_CHECK_NAMES, HEALTH_CHECK_TIMEOUT_MS } from '../constants/health.constants';
import { combineHealth } from '../policies/health-state.policy';
import type { HealthCheck, HealthReport } from '../types/health.types';

/**
 * The readiness probe.
 *
 * Both checks are cheap and read-only: `SELECT 1` and an existence check for a
 * key that is never written. A probe that writes would make the health endpoint
 * an unauthenticated write path, and a probe that reads real rows would make
 * the load balancer a source of database load proportional to fleet size.
 *
 * Failures are logged with their reason and reported without it. The operator
 * gets the diagnosis from the logs they already have access to; the endpoint
 * gives an anonymous caller nothing to work with.
 */
export async function checkHealth(): Promise<HealthReport> {
  const env = getServerEnv();
  const probes = [checkDatabase(), checkStorage()];
  if (env.CLAMAV_ENABLED) probes.push(checkScanner());
  if (env.AUTH_REQUIRE_EMAIL_VERIFICATION) probes.push(checkEmail());
  const checks = await Promise.all(probes);

  return { state: combineHealth(checks), checks };
}

export async function checkEmail(): Promise<HealthCheck> {
  return timed(HEALTH_CHECK_NAMES.email, async () => {
    await checkConfiguredEmailTransport(HEALTH_CHECK_TIMEOUT_MS);
  });
}

export async function checkScanner(): Promise<HealthCheck> {
  const env = getServerEnv();
  return timed(HEALTH_CHECK_NAMES.scanner, async () => {
    const alive = await pingClamAv({
      host: env.CLAMAV_HOST,
      port: env.CLAMAV_PORT,
      timeoutMs: Math.min(env.CLAMAV_TIMEOUT_MS, HEALTH_CHECK_TIMEOUT_MS),
    });
    if (!alive) throw new Error('scanner unavailable');
    const version = await getClamAvVersion({
      host: env.CLAMAV_HOST,
      port: env.CLAMAV_PORT,
      timeoutMs: Math.min(env.CLAMAV_TIMEOUT_MS, HEALTH_CHECK_TIMEOUT_MS),
    });
    if (
      !signatureDatabaseIsFresh(
        version === null ? null : parseClamAvSignatureDate(version),
        new Date(),
        env.CLAMAV_MAX_SIGNATURE_AGE_HOURS,
      )
    )
      throw new Error('scanner signatures stale');
  });
}

export async function checkDatabase(): Promise<HealthCheck> {
  return timed(HEALTH_CHECK_NAMES.database, async () => {
    await getDatabase().$queryRaw`SELECT 1`;
  });
}

export async function checkStorage(): Promise<HealthCheck> {
  return timed(HEALTH_CHECK_NAMES.storage, async () => {
    await getObjectStorage().exists('health/probe');
  });
}

/**
 * Run one probe under a deadline and record how long it took.
 *
 * The timeout is the point. A hung TCP connection resolves neither way, and
 * without a deadline this endpoint inherits that hang — reporting nothing at
 * all instead of reporting a failure.
 */
export async function timed(name: string, probe: () => Promise<void>): Promise<HealthCheck> {
  const startedAt = performance.now();

  try {
    await Promise.race([probe(), rejectAfter(HEALTH_CHECK_TIMEOUT_MS)]);

    return { name, state: 'ok', latencyMs: elapsed(startedAt) };
  } catch (error) {
    logger.error('health.check_failed', { check: name, reason: String(error) });

    return { name, state: 'down', latencyMs: elapsed(startedAt) };
  }
}

export function elapsed(startedAt: number): number {
  return Math.round(performance.now() - startedAt);
}

export async function rejectAfter(milliseconds: number): Promise<never> {
  return new Promise<never>((_resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('health check timed out'));
    }, milliseconds);

    // A pending probe timer must not hold the process open on shutdown.
    timer.unref();
  });
}
