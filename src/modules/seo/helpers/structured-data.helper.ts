import type { PortfolioDocument } from '@/modules/portfolio-document';

import type { PersonStructuredData } from '../types/seo.types';

/**
 * `Person` structured data built strictly from published, reviewed fields.
 *
 * Optional keys are omitted rather than emitted empty: a `sameAs` array of one
 * blank string, or an address with no locality, is a claim about a real person
 * that nobody made.
 */
export function buildPersonStructuredData(
  document: PortfolioDocument,
  url: string,
): PersonStructuredData {
  const sameAs = document.links.filter((link) => link.visible).map((link) => link.url);

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: document.identity.displayName,
    url,
    ...(document.identity.headline !== '' && { jobTitle: document.identity.headline }),
    ...(document.identity.summary !== null && { description: document.identity.summary }),
    ...(document.identity.location !== null && {
      address: {
        '@type': 'PostalAddress' as const,
        addressLocality: document.identity.location,
      },
    }),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

/**
 * Serialise for a `<script type="application/ld+json">` body.
 *
 * `<` is escaped because a `</script>` sequence inside a JSON string value
 * would close the tag early and turn published content into markup — the one
 * XSS vector that survives React's escaping, since script bodies are not
 * escaped by it.
 */
export function serializeStructuredData(data: PersonStructuredData): string {
  return JSON.stringify(data).replaceAll('<', String.raw`\u003c`);
}
