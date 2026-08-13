import { describe, expect, it } from 'vitest';

import { parseSchema } from '@/packages/zod';

import {
  adminPortfolioDeletionSchema,
  adminPortfolioSuspensionSchema,
} from '../schemas/admin-portfolio.schema';

describe('admin portfolio schemas', () => {
  it.each([
    ['true', true],
    ['false', false],
  ])('parses suspend=%s', (suspend, expected) => {
    expect(
      parseSchema(adminPortfolioSuspensionSchema, { portfolioId: 'portfolio-1', suspend }),
    ).toEqual({
      ok: true,
      value: { portfolioId: 'portfolio-1', suspend: expected },
    });
  });

  it('rejects missing and oversized portfolio ids', () => {
    expect(parseSchema(adminPortfolioDeletionSchema, { portfolioId: '' }).ok).toBe(false);
    expect(parseSchema(adminPortfolioDeletionSchema, { portfolioId: 'x'.repeat(121) }).ok).toBe(
      false,
    );
  });
});
