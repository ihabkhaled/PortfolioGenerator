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

/**
 * A real URL scheme, which never contains a dot.
 *
 * The exclusion is deliberate: `coerceExtractedUrl` uses this to decide
 * whether an address already carries a scheme, and a pattern allowing dots
 * would read a bare "example.com:8080/path" as the scheme "example.com:" and
 * refuse to repair it.
 */
export const URL_SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z0-9+-]*:/u;

/** Label punctuation and protocol-relative slashes left on a pasted address. */
export const URL_LEADING_PUNCTUATION_PATTERN = /^[\s./]+/u;
