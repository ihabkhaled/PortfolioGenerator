import { portfolioDocumentSchema } from '@/modules/portfolio-document';
import { SLUG_MAX_LENGTH } from '@/modules/publishing';
import { z } from '@/packages/zod';

/**
 * What a save action accepts.
 *
 * The whole document, plus the version the editor believed it was editing. The
 * version is what makes concurrent edits safe: without it, the last tab to hit
 * save silently wins and the other person's work disappears with no error.
 *
 * The document is parsed with the canonical schema — the editor is not a
 * trusted client, it is a browser, and a form post is as untrusted as anything
 * a model produced.
 */
export const saveDraftSchema = z.object({
  portfolioId: z.string().min(1).max(120),
  expectedVersion: z.coerce.number().int().min(1),
  document: portfolioDocumentSchema,
});

export const claimSlugSchema = z.object({
  portfolioId: z.string().min(1).max(120),
  slug: z.string().trim().max(SLUG_MAX_LENGTH),
});

export const portfolioIdSchema = z.object({
  portfolioId: z.string().min(1).max(120),
});
