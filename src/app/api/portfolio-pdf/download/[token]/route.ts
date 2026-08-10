import type { NextRequest } from 'next/server';

import { buildPortfolioPdfDownloadFilename } from '@/modules/portfolio-pdf';
import {
  getOrGeneratePortfolioPdf,
  PORTFOLIO_PDF_DOWNLOAD_NO_STORE_HEADERS,
  resolvePortfolioIdFromDownloadToken,
} from '@/modules/portfolio-pdf/server';
import { getPublishedPortfolioById } from '@/modules/portfolios/server';
import { logger } from '@/packages/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
/*
 * Printing every public page of a portfolio and merging the results happens
 * in this request — see the "synchronous, not a queue" note in
 * `portfolio-pdf.service.ts` for why. 60s covers the documented worst case
 * (12 pages, `DOCUMENT_COUNTS.pages`) with headroom; a cache hit, which is
 * the common case after the first download, returns in well under a second.
 */
export const maxDuration = 60;

/**
 * An unknown token, an expired one, an unpublished portfolio and a portfolio
 * with nothing public to render are all the same response. Distinguishing
 * them would tell a caller which guess landed closer to a real one — the
 * same anti-enumeration reasoning `signInAction` documents for credentials.
 */
function notFound(): Response {
  return new Response(null, { status: 404, headers: PORTFOLIO_PDF_DOWNLOAD_NO_STORE_HEADERS });
}

export async function GET(
  _request: NextRequest,
  context: { readonly params: Promise<{ readonly token: string }> },
): Promise<Response> {
  const { token } = await context.params;
  const now = new Date();

  try {
    const portfolioId = await resolvePortfolioIdFromDownloadToken(token, now);

    if (portfolioId === null) {
      return notFound();
    }

    // Re-checked here, not assumed from the token's existence: a portfolio
    // can be unpublished within the token's 8-hour window, and the token
    // alone must never be enough to keep serving it.
    const portfolio = await getPublishedPortfolioById(portfolioId);

    if (portfolio === null) {
      return notFound();
    }

    const bytes = await getOrGeneratePortfolioPdf(portfolio, now);

    if (bytes === null) {
      return notFound();
    }

    const encodedName = encodeURIComponent(buildPortfolioPdfDownloadFilename(portfolio.slug));

    return new Response(Buffer.from(bytes), {
      headers: {
        ...PORTFOLIO_PDF_DOWNLOAD_NO_STORE_HEADERS,
        'Content-Disposition': `attachment; filename*=UTF-8''${encodedName}`,
        'Content-Length': String(bytes.length),
        'Content-Type': 'application/pdf',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    // A rendering failure (a Chromium crash, a network hiccup mid-print) is
    // not "this link is invalid" and gets its own generic response, with
    // nothing about the failure — no stack trace, no internal path — leaving
    // this handler.
    logger.error('portfolio_pdf.download.failed', {
      message: error instanceof Error ? error.message : 'unknown error',
    });

    return Response.json(
      { error: 'generation_failed' },
      { status: 500, headers: PORTFOLIO_PDF_DOWNLOAD_NO_STORE_HEADERS },
    );
  }
}
