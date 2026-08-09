import { parseSchema, z } from '@/packages/zod';

import type { ContactSubmission } from '../types/contact.types';

const headerValue = z.string().trim().min(1).max(200).refine((value) => !/[\r\n]/u.test(value));

const contactSubmissionSchema = z.object({
  name: headerValue,
  email: z.string().trim().max(254).refine((value) => !/[\r\n]/u.test(value)).pipe(z.email()),
  subject: headerValue,
  message: z.string().trim().min(1).max(5000),
  website: z.string().trim().max(500).default(''),
});

export function parseContactSubmission(input: unknown):
  | { readonly ok: true; readonly value: ContactSubmission }
  | { readonly ok: false } {
  const result = parseSchema(contactSubmissionSchema, input);
  return result.ok ? result : { ok: false };
}
