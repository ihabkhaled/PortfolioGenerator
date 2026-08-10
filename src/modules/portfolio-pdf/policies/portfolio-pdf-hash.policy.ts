import type { PortfolioDocument } from '@/modules/portfolio-document';
import { sha256Hex } from '@/packages/cryptography';

/**
 * A content fingerprint, so a republish that changes nothing does not throw
 * away a perfectly good cached PDF — the owner's own spec: "only if anything
 * changed then invalidate the cache and re-generate."
 *
 * Plain `JSON.stringify` rather than a canonicalizer with sorted keys: every
 * input here is a document that has just come out of
 * `portfolioDocumentSchema`, whose key order is the schema's own and is
 * therefore identical for two structurally equal documents. A canonicalizer
 * would only earn its cost against untrusted or hand-built JSON, which this
 * value never is.
 */
export function hashPortfolioDocument(document: PortfolioDocument): string {
  return sha256Hex(JSON.stringify(document));
}

export function hasPortfolioContentChanged(previousHash: string, nextHash: string): boolean {
  return previousHash !== nextHash;
}
