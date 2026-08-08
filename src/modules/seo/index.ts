/** Public surface of the seo module (pure helpers; framework metadata lives in ./server). */

export {
  OG_HEADLINE_MAX_LENGTH,
  OG_IMAGE_CACHE_CONTROL,
  OG_NAME_MAX_LENGTH,
} from './constants/og-image.constants';
export {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SEO_DESCRIPTION_MAX_LENGTH,
  SITEMAP_CHANGE_FREQUENCY,
} from './constants/seo.constants';
export { StructuredData } from './components/structured-data.component';
export { buildOgCardValues } from './helpers/og-card.helper';
export {
  buildPlatformSitemapEntries,
  buildPortfolioSitemapEntries,
  toSitemapPortfolio,
} from './helpers/sitemap.helper';
export {
  buildDefaultDescription,
  buildDefaultTitle,
  buildPageUrl,
  buildPortfolioMetadataValues,
  truncate,
} from './helpers/portfolio-metadata.helper';
export {
  buildPersonStructuredData,
  serializeStructuredData,
} from './helpers/structured-data.helper';
export type { OgCardValues } from './types/og-card.types';
export type { StructuredDataProps } from './types/structured-data.types';
export type { SitemapEntry, SitemapPortfolio } from './types/sitemap.types';
export type {
  PersonStructuredData,
  PortfolioMetadataInput,
  PortfolioMetadataValues,
} from './types/seo.types';
