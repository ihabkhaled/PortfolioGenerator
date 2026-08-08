/**
 * Reasons a portfolio cannot be published yet.
 *
 * Machine-readable so the publish screen can render each one next to the field
 * that fixes it, rather than as a paragraph the user has to decode.
 */
export const PUBLISH_BLOCKERS = {
  missingName: 'missing-name',
  missingHeadline: 'missing-headline',
  emptyPortfolio: 'empty-portfolio',
  noVisibleHomePage: 'no-visible-home-page',
} as const;

export const PUBLISH_FAILURES = {
  notFound: 'not-found',
  notReady: 'not-ready',
  slugTaken: 'slug-taken',
  invalidSlug: 'invalid-slug',
  invalidDocument: 'invalid-document',
} as const;
