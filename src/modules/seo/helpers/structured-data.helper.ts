import type { PortfolioDocument } from '@/modules/portfolio-document';

import type { PersonStructuredData } from '../types/seo.types';
import type { DangerousMarkup } from '../types/structured-data.types';

/**
 * `Person` structured data built strictly from published, reviewed fields.
 *
 * Absent keys are omitted rather than emitted empty. A `sameAs` array holding
 * one blank string, or an address with no locality, is a machine-readable claim
 * about a real person that nobody actually made — and structured data is
 * exactly the surface where an invented claim gets believed.
 */
export function buildPersonStructuredData(
  document: PortfolioDocument,
  url: string,
): PersonStructuredData {
  const sameAs = document.links.filter((link) => link.visible).map((link) => link.url);
  const structuredData: PersonStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: document.identity.displayName,
    url,
  };

  return {
    ...structuredData,
    ...(document.identity.headline !== null && { jobTitle: document.identity.headline }),
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
 * would close the tag early and turn published content into markup. It is the
 * one XSS vector React's escaping does not cover, because a script body is not
 * escaped by it.
 */
export function serializeStructuredData(data: PersonStructuredData): string {
  return JSON.stringify(data).replaceAll('<', '\\u003c');
}

/**
 * Wrap an already-escaped payload for `dangerouslySetInnerHTML`.
 *
 * Exists so the prop is not an inline object literal in the component — and,
 * more usefully, so there is exactly one place that produces this shape and it
 * sits next to the escaping that makes it safe.
 */
export function toStructuredDataMarkup(json: string): DangerousMarkup {
  return { __html: json };
}
