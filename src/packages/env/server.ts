import 'server-only';

/**
 * Server-only environment facade. The `server-only` import makes importing this
 * module from a client component a build error, which is the mechanism that
 * keeps the AI key, the storage credentials and the auth secret out of the
 * browser bundle.
 *
 * Validation is lazy and memoized: reading (and therefore requiring) every
 * server variable at module load would break `next build`, which imports route
 * modules in an environment that has no runtime secrets.
 */

import { formatIssues, parseSchema } from '@/packages/zod';

import {
  aiRemoteConfiguredSchema,
  contactEmailConfiguredSchema,
  paypalConfiguredSchema,
  s3ConfiguredSchema,
  serverEnvSchema,
} from './env.schema';
import type { ServerEnv } from './env.types';

const cache: { value: ServerEnv | null } = { value: null };

function validateProductionRequirements(environment: ServerEnv): void {
  if (
    environment.EMAIL_CAPTURE_PATH &&
    (environment.NODE_ENV !== 'test' || environment.NEXT_PUBLIC_APP_ENV === 'production')
  ) {
    throw new Error('EMAIL_CAPTURE_PATH requires test mode outside public production');
  }
  // Next sets NODE_ENV=production while collecting route data during every
  // production build. Deployment requirements belong to the explicit public
  // environment so local and preview builds do not require runtime services.
  const isProduction = environment.NEXT_PUBLIC_APP_ENV === 'production';
  // CLAMAV_ENABLED is deliberately *not* required here. It was, and it made the
  // application undeployable on any platform without a private network to reach
  // clamd on. Scanning is still fail-closed when it is on; leaving it off is now
  // a recorded operational risk (docs/launch-readiness.md) rather than a boot
  // failure that takes the whole site down.
  if (isProduction && environment.CRON_SECRET === undefined) {
    throw new Error('CRON_SECRET is required in production');
  }
  if (isProduction && !environment.AUTH_REQUIRE_EMAIL_VERIFICATION) {
    throw new Error('AUTH_REQUIRE_EMAIL_VERIFICATION=true is required in production');
  }
  if (environment.AUTH_REQUIRE_EMAIL_VERIFICATION && !environment.CONTACT_EMAIL_ENABLED) {
    throw new Error('AUTH_REQUIRE_EMAIL_VERIFICATION=true requires CONTACT_EMAIL_ENABLED=true');
  }
  if (isProduction && environment.ADMIN_AUTH_SECRET === environment.BETTER_AUTH_SECRET) {
    throw new Error('ADMIN_AUTH_SECRET must not equal BETTER_AUTH_SECRET in production');
  }
}

export function parseServerEnvironment(input: unknown): ServerEnv {
  const parsed = parseSchema(serverEnvSchema, input);

  if (!parsed.ok) {
    throw new Error(`Invalid server environment: ${formatIssues(parsed.issues)}`);
  }

  // Conditional requirements: a driver selected without its credentials would
  // otherwise fail at the first upload or the first extraction — long after
  // deploy, and only for the unlucky user who triggered it.
  if (parsed.value.STORAGE_DRIVER === 's3') {
    const s3 = parseSchema(s3ConfiguredSchema, parsed.value);

    if (!s3.ok) {
      throw new Error(`STORAGE_DRIVER=s3 requires: ${formatIssues(s3.issues)}`);
    }
  }

  if (parsed.value.AI_PROVIDER === 'openai-compatible') {
    const ai = parseSchema(aiRemoteConfiguredSchema, parsed.value);

    if (!ai.ok) {
      throw new Error(`AI_PROVIDER=openai-compatible requires: ${formatIssues(ai.issues)}`);
    }
  }

  if (parsed.value.CONTACT_EMAIL_ENABLED && parsed.value.EMAIL_CAPTURE_PATH === undefined) {
    const contactEmail = parseSchema(contactEmailConfiguredSchema, parsed.value);

    if (!contactEmail.ok) {
      throw new Error(`CONTACT_EMAIL_ENABLED=true requires: ${formatIssues(contactEmail.issues)}`);
    }
  }

  // PayPal billing has no explicit enable flag — presence decides it, the same
  // as AI_GOOGLE_API_KEY for translation. Any one of the four values being set
  // is enough to require the complete set, so a half-entered credential is a
  // boot failure rather than a checkout that fails for the first real user.
  const paypalFieldsPresent = [
    parsed.value.PAYPAL_CLIENT_ID,
    parsed.value.PAYPAL_CLIENT_SECRET,
    parsed.value.PAYPAL_WEBHOOK_ID,
    parsed.value.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
  ].some((value) => value !== undefined);

  if (paypalFieldsPresent) {
    const paypal = parseSchema(paypalConfiguredSchema, parsed.value);

    if (!paypal.ok) {
      throw new Error(`PayPal billing requires: ${formatIssues(paypal.issues)}`);
    }
  }

  validateProductionRequirements(parsed.value);

  return parsed.value;
}

export function getServerEnv(): ServerEnv {
  if (cache.value) {
    return cache.value;
  }

  cache.value = parseServerEnvironment(process.env);

  return cache.value;
}

/** Test-only hook so a suite can exercise a different configuration. */
export function resetServerEnvCache(): void {
  cache.value = null;
}
