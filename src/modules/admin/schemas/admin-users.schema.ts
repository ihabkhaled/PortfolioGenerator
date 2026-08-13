import { z } from '@/packages/zod';

/** A better-auth user id: opaque, non-empty, and bounded — the same shape `portfolioDeletionSchema` validates ids with in `src/modules/account/schemas/account.schema.ts`. */
export const adminUserIdSchema = z.object({
  userId: z.string().min(1).max(120),
});

export const adminUserStatusChangeSchema = z.object({
  userId: z.string().min(1).max(120),
  status: z.enum(['ACTIVE', 'SUSPENDED']),
});
