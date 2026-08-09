import { parseSchema, z } from '@/packages/zod';

import {
  PRIVATE_PAGE_PASSWORD_MAX_LENGTH,
  PRIVATE_PAGE_PASSWORD_MIN_LENGTH,
} from '../constants/private-page-owner.constants';
import type { SetPrivatePageAccessInput } from '../types/private-page-owner.types';

const privatePageOwnerSchema = z.object({
  portfolioId: z.string().min(1).max(120),
  pageId: z.string().min(1).max(120),
  expectedVersion: z.coerce.number().int().min(1),
  visibility: z.enum(['public', 'private']),
  password: z.string().max(PRIVATE_PAGE_PASSWORD_MAX_LENGTH),
});

export function parsePrivatePageOwnerInput(input: unknown):
  | { readonly ok: true; readonly value: Omit<SetPrivatePageAccessInput, 'ownerId'> }
  | { readonly ok: false } {
  const parsed = parseSchema(privatePageOwnerSchema, input);

  if (
    !parsed.ok ||
    (parsed.value.visibility === 'private' &&
      parsed.value.password.length < PRIVATE_PAGE_PASSWORD_MIN_LENGTH)
  ) {
    return { ok: false } as const;
  }

  return parsed;
}
