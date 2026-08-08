import { DOCUMENT_LIMITS } from '@/modules/portfolio-document';
import { SLUG_MAX_LENGTH } from '@/modules/publishing';
import { z } from '@/packages/zod';

export const portfolioCreationSchema = z.object({
  displayName: z.string().trim().min(1).max(DOCUMENT_LIMITS.displayName),
  // Empty means "suggest one for me"; the action fills it from the name.
  slug: z.string().trim().max(SLUG_MAX_LENGTH).default(''),
});
