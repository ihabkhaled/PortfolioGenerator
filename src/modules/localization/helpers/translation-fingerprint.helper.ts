import type { PortfolioDocument } from '@/modules/portfolio-document';
import { sha256Hex } from '@/packages/cryptography';

/** Identifies the exact English draft from which a translation was derived. */
export function fingerprintTranslationSource(document: PortfolioDocument): string {
  return sha256Hex(JSON.stringify(document));
}
