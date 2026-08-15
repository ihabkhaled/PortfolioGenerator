import { describe, expect, it, vi } from 'vitest';

vi.mock('@/packages/pdf-renderer', () => {
  throw new Error('browser runtime is unavailable');
});

describe('portfolio PDF renderer import boundary', () => {
  it('does not load the browser runtime until a PDF is requested', async () => {
    const { createPlaywrightPortfolioPdfRenderer } =
      await import('../providers/playwright-portfolio-pdf-renderer.provider');

    expect(typeof createPlaywrightPortfolioPdfRenderer().renderPortfolioPdf).toBe('function');
  });
});
