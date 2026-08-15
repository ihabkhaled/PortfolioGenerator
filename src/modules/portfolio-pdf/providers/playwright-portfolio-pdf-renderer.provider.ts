import type { PortfolioPdfRenderer } from '../types/portfolio-pdf.types';

/**
 * The real renderer: one headless Chromium session prints every public page
 * of the portfolio — the same pages a visitor would reach by clicking through
 * the site, not a second render path built to imitate them — and the results
 * are merged into a single file in navigation order.
 *
 * Printed one page at a time rather than concurrently. A portfolio has at
 * most 12 pages (`DOCUMENT_COUNTS.pages`), and opening that many Chromium
 * tabs at once in a serverless function with a fixed memory budget trades a
 * predictable few extra seconds of latency for not risking an out-of-memory
 * crash on the largest portfolios this feature will ever see.
 */
export function createPlaywrightPortfolioPdfRenderer(): PortfolioPdfRenderer {
  return {
    async renderPortfolioPdf(pageUrls) {
      // Loading Chromium at module scope makes every action that reaches the
      // publishing surface depend on Playwright's deployment-only files. Keep
      // that runtime behind the one operation that actually prints a PDF.
      const { createPdfPrintSession, mergePdfPages } = await import('@/packages/pdf-renderer');
      const session = await createPdfPrintSession();

      try {
        const printedPages: Uint8Array[] = [];

        for (const url of pageUrls) {
          printedPages.push(await session.printUrl(url));
        }

        return await mergePdfPages(printedPages);
      } finally {
        await session.close();
      }
    },
  };
}
