/** Public surface of the seo module (pure helpers; framework metadata lives in ./server). */

export {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SEO_DESCRIPTION_MAX_LENGTH,
  SITEMAP_CHANGE_FREQUENCY,
} from './constants/seo.constants';
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
export type {
  PersonStructuredData,
  PortfolioMetadataInput,
  PortfolioMetadataValues,
} from './types/seo.types';
