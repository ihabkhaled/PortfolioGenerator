/** Protocols allowed to appear as an anchor in published content. */
export const SAFE_URL_PROTOCOLS: readonly string[] = ['https:', 'mailto:'];

/** Matches the `url` bound in the PortfolioDocument schema. */
export const URL_MAX_LENGTH = 2048;

/** PDF files start with these bytes; the browser-reported MIME type does not count. */
export const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46] as const;

/**
 * Cache lifetime for a published portfolio snapshot. Publishing invalidates the
 * tag immediately, so this bound only matters if an invalidation is ever lost.
 */
export const PUBLISHED_PORTFOLIO_REVALIDATE_SECONDS = 3600;

/**
 * Bound on a stored warning string before it is rendered.
 *
 * The column is JSONB written by past builds, so a value there is as untrusted
 * as anything else that survives a deploy.
 */
export const WARNING_TEXT_MAX_LENGTH = 400;
