import { parseSchema, z } from '@/packages/zod';

import type { PrivatePageUnlockSubmission } from '../types/private-page-access.types';

const routeSegment = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9-]+$/u)
  .refine((value) => !value.startsWith('-') && !value.endsWith('-') && !value.includes('--'));

const privatePageUnlockSchema = z.object({
  portfolioSlug: routeSegment,
  pageSlug: routeSegment,
  password: z.string().min(1).max(200),
});

export function parsePrivatePageUnlockSubmission(input: unknown):
  | { readonly ok: true; readonly value: PrivatePageUnlockSubmission }
  | { readonly ok: false } {
  const parsed = parseSchema(privatePageUnlockSchema, input);

  return parsed.ok ? parsed : { ok: false };
}
