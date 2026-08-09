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
  s3ConfiguredSchema,
  serverEnvSchema,
} from './env.schema';
import type { ServerEnv } from './env.types';

const cache: { value: ServerEnv | null } = { value: null };

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

  if (parsed.value.CONTACT_EMAIL_ENABLED) {
    const contactEmail = parseSchema(contactEmailConfiguredSchema, parsed.value);

    if (!contactEmail.ok) {
      throw new Error(`CONTACT_EMAIL_ENABLED=true requires: ${formatIssues(contactEmail.issues)}`);
    }
  }

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
