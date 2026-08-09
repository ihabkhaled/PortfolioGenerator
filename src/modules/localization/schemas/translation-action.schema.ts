import { z } from '@/packages/zod';

import { APP_LOCALES } from '../constants/locale.constants';

export const translationActionSchema = z.object({
  portfolioId: z.string().min(1).max(120),
  locale: z.enum(APP_LOCALES).refine((locale) => locale !== 'en'),
});

export const versionedTranslationActionSchema = translationActionSchema.extend({
  expectedVersion: z.coerce.number().int().positive(),
});
