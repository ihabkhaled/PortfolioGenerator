import 'server-only';

import type { Metadata } from 'next';

import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from './constants/seo.constants';
import { buildPortfolioMetadataValues } from './helpers/portfolio-metadata.helper';
import type { PortfolioMetadataInput } from './types/seo.types';

/**
 * Framework metadata for a published portfolio page.
 *
 * Kept separate from the pure helper so the values can be asserted in a unit
 * test without importing Next's metadata types, and so the mapping from
 * "reviewed fields" to "what a crawler sees" is visible in one short function.
 */
export function buildPortfolioMetadata(input: PortfolioMetadataInput): Metadata {
  const values = buildPortfolioMetadataValues(input);

  return {
    title: values.title,
    description: values.description,
    alternates: { canonical: values.canonical },
    robots: values.indexable
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
    openGraph: {
      type: 'profile',
      title: values.title,
      description: values.description,
      url: values.canonical,
      siteName: values.displayName,
      images: [{ url: values.imageUrl, width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT }],
    },
    twitter: {
      card: 'summary_large_image',
      title: values.title,
      description: values.description,
      images: [values.imageUrl],
    },
  };
}

export { buildPortfolioMetadataValues } from './helpers/portfolio-metadata.helper';
