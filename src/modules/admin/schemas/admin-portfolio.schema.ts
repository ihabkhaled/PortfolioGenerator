import { z } from '@/packages/zod';

export const adminPortfolioSuspensionSchema = z.object({
  portfolioId: z.string().min(1).max(120),
  suspend: z.enum(['true', 'false']).transform((value) => value === 'true'),
});

export const adminPortfolioDeletionSchema = z.object({
  portfolioId: z.string().min(1).max(120),
});
