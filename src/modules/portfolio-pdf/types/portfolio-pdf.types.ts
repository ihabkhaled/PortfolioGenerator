/**
 * Two independent expirations live in this module, and nothing below may
 * conflate them: the rendered PDF bytes are cached for days, the download
 * token that points at them rotates in hours. A cache hit under an old token
 * is a bug; so is a fresh token pointing at nothing because the byte cache
 * merely expired.
 */

export interface PortfolioPdfCacheMeta {
  readonly contentHash: string;
  readonly generatedAt: Date;
}

export interface PortfolioPdfCacheEntry extends PortfolioPdfCacheMeta {
  readonly bytes: Uint8Array;
}

/**
 * Keyed by portfolio id — never by slug, which can change without the content
 * changing. Every method takes `now` explicitly, even the Redis-backed
 * implementation that lets Redis's own `EX` enforce the TTL: the in-memory
 * fallback has no such primitive and needs a caller-supplied clock to expire
 * entries deterministically, in tests and in production alike.
 */
export interface PortfolioPdfCache {
  get: (portfolioId: string, now: Date) => Promise<PortfolioPdfCacheEntry | null>;
  /** Metadata alone, so a publish that only wants to compare a hash does not pull PDF bytes out of Redis to do it. */
  getMeta: (portfolioId: string, now: Date) => Promise<PortfolioPdfCacheMeta | null>;
  set: (portfolioId: string, bytes: Uint8Array, contentHash: string, now: Date) => Promise<void>;
  delete: (portfolioId: string) => Promise<void>;
}

/**
 * Maps a public, unguessable token to the portfolio it downloads and back.
 * The reverse direction (`getOrCreateToken`) is what lets the public page
 * embed a working link without ever putting the portfolio id or slug in it.
 */
export interface PortfolioPdfTokenStore {
  /**
   * Null only when issuance itself is unavailable (the Redis-backed store
   * could reach neither an existing token nor mint a durable new one) — the
   * public page treats that as "no download link right now" rather than
   * rendering a link that can never resolve.
   */
  getOrCreateToken: (portfolioId: string, now: Date) => Promise<string | null>;
  /** Null for an unknown or expired token — the two are indistinguishable by design. */
  resolveToken: (token: string, now: Date) => Promise<string | null>;
}

export interface PortfolioPdfRenderer {
  /** Print every URL and return one merged PDF, in the order given. */
  renderPortfolioPdf: (pageUrls: readonly string[]) => Promise<Uint8Array>;
}

export interface PortfolioPdfDownloadLinkProps {
  /** `/api/portfolio-pdf/download/{token}` — never the portfolio id or slug. */
  readonly href: string;
  readonly label: string;
  readonly downloadFilename: string;
}

/** In-memory cache row: the entry plus when it stops being fresh. */
export interface StoredPortfolioPdfCacheEntry extends PortfolioPdfCacheEntry {
  readonly expiresAt: number;
}

/** In-memory token row: both directions of the token/portfolio mapping. */
export interface StoredPortfolioPdfToken {
  readonly token: string;
  readonly portfolioId: string;
  readonly expiresAt: number;
}

/** The JSON shape stored in Redis's metadata key — a string timestamp, unlike `PortfolioPdfCacheMeta`. */
export interface RedisPortfolioPdfCacheMeta {
  readonly contentHash: string;
  readonly generatedAt: string;
}
