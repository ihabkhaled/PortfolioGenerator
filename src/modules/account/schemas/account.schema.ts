import { z } from '@/packages/zod';

import { ACCOUNT_DELETE_CONFIRMATION } from '../constants/deletion.constants';

export const portfolioDeletionSchema = z.object({
  portfolioId: z.string().min(1).max(120),
});

/**
 * The typed confirmation is validated on the server, not only in the browser.
 *
 * The client check is a courtesy; this one is the guarantee. A form post that
 * skips the field entirely — a stale tab, a script, a mis-fired fetch — must
 * not be able to delete an account because the interruption lived in a React
 * component.
 */
export const accountDeletionSchema = z.object({
  confirmation: z.literal(ACCOUNT_DELETE_CONFIRMATION),
});
