/**
 * The owner's spec, verbatim: cache the rendered PDF for about five days,
 * unless a republish with different content invalidates it sooner; rotate
 * the download token every eight hours regardless of whether the PDF itself
 * is still fresh. Two different numbers on purpose — see the module's types.
 */
export const PDF_CACHE_TTL_SECONDS = 5 * 24 * 60 * 60;
export const DOWNLOAD_TOKEN_TTL_SECONDS = 8 * 60 * 60;

/** 32 bytes of crypto randomness, hex-encoded — not derived from the portfolio id or slug. */
export const DOWNLOAD_TOKEN_RANDOM_BYTES = 32;

/** Exactly what `randomBytesBuffer(DOWNLOAD_TOKEN_RANDOM_BYTES).toString('hex')` produces. */
export const DOWNLOAD_TOKEN_PATTERN = /^[a-f0-9]{64}$/u;

/** The download route's response headers on every path: success, 404 and 500 alike. */
export const PORTFOLIO_PDF_DOWNLOAD_NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
} as const;

export const REDIS_KEY_PREFIXES = {
  cacheBytes: 'pdf:cache:bytes:',
  cacheMeta: 'pdf:cache:meta:',
  tokenToPortfolio: 'pdf:token:',
  portfolioToToken: 'pdf:token:owner:',
} as const;
