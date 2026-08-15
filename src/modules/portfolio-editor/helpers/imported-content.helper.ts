import type { PortfolioDocument, PortfolioCompany } from '@/modules/portfolio-document';

/** Editor-facing read surface for evidence-backed imported employer facts. */
export function getImportedCompanies(document: PortfolioDocument): readonly PortfolioCompany[] {
  return document.companies;
}

/** Editor-facing read surface for the observed page order, when reliable. */
export function getImportedPageOrder(document: PortfolioDocument): readonly string[] | null {
  return document.source.pageOrder;
}
