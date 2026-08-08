import { getPublishedPortfolio } from '@/modules/portfolios/server';
import { OG_IMAGE_CACHE_CONTROL, OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/modules/seo';
import { buildOgCardValues, PortfolioOgCard } from '@/modules/seo/server';
import { ImageResponse } from '@/packages/og';

/**
 * The share card for a published portfolio.
 *
 * A route handler rather than the `opengraph-image` file convention, because
 * that convention appends a content hash to the URL and the metadata for this
 * page is built by hand — the two would disagree, and a share preview that
 * 404s is worse than none. The path is reserved in
 * `PORTFOLIO_SUBPATH_SEGMENTS` so no tenant page can shadow it.
 *
 * Unpublished and unknown slugs return 404 rather than a generic card. A
 * placeholder image would confirm that a slug exists, which is the one thing
 * the public routes are careful not to leak.
 */

interface OgImageRouteProps {
  readonly params: Promise<{ portfolioSlug: string }>;
}

export async function GET(_request: Request, props: OgImageRouteProps): Promise<Response> {
  const { portfolioSlug } = await props.params;
  const portfolio = await getPublishedPortfolio(portfolioSlug);

  if (portfolio === null) {
    return new Response(null, { status: 404 });
  }

  return new ImageResponse(
    <PortfolioOgCard {...buildOgCardValues(portfolio.document, portfolioSlug)} />,
    {
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      headers: { 'Cache-Control': OG_IMAGE_CACHE_CONTROL },
    },
  );
}
