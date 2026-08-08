/**
 * The OG card is rendered by satori, not by the browser, so it cannot read the
 * CSS custom properties the rest of the design system uses. These values are
 * the dark palette from `styles.css`, duplicated deliberately and in one place
 * so the duplication is visible rather than scattered through the route.
 */
export const OG_COLORS = {
  canvas: '#0d1117',
  surface: '#151c26',
  foreground: '#e8edf5',
  muted: '#9aa6ba',
  border: '#26303d',
  accent: '#7fa6ff',
} as const;

/** Bounds that keep a long name or headline inside the card. */
export const OG_NAME_MAX_LENGTH = 60;
export const OG_HEADLINE_MAX_LENGTH = 120;

/** Cached at the edge for a day; publishing does not change the card's content. */
export const OG_IMAGE_CACHE_CONTROL = 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800';
