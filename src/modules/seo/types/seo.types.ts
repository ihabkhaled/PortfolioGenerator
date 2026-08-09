import type { PortfolioDocument, PortfolioPage } from '@/modules/portfolio-document';

export interface PortfolioMetadataInput {
  readonly document: PortfolioDocument;
  readonly page: PortfolioPage;
  readonly portfolioSlug: string;
  readonly locale?: string;
  readonly availableLocales?: readonly string[];
  readonly includeEnglishAlternate?: boolean;
}

export interface PortfolioMetadataValues {
  readonly canonical: string;
  readonly title: string;
  readonly description: string;
  readonly indexable: boolean;
  readonly imageUrl: string;
  readonly displayName: string;
  readonly languageAlternates: Readonly<Record<string, string>>;
}

export interface PersonStructuredData {
  readonly '@context': 'https://schema.org';
  readonly '@type': 'Person';
  readonly name: string;
  readonly url: string;
  readonly jobTitle?: string;
  readonly description?: string;
  readonly address?: { readonly '@type': 'PostalAddress'; readonly addressLocality: string };
  readonly sameAs?: readonly string[];
}

export interface PlatformMetadataAlternates {
  readonly canonical: string;
  readonly languages: Readonly<Record<string, string>>;
}
