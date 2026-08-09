/**
 * Public surface of the portfolio-renderer module.
 *
 * Nothing here may reach the AI provider, the ingestion pipeline, the editor or
 * object storage — the `no-authoring-imports-in-public-render` lint rule
 * enforces it, because a published portfolio has to render when all of those
 * are unavailable, and none of that code belongs in an anonymous visitor's
 * bundle.
 */

export { PortfolioNav } from './components/portfolio-nav.component';
export { PortfolioTemplate } from './components/portfolio-template';
export { SectionRenderer } from './components/section-renderer';
export { buildPortfolioLabels } from './helpers/portfolio-labels.helper';
export { formatDateRange, formatMonth } from './helpers/date-range.helper';
export {
  buildCertificationEntries,
  buildEducationEntries,
  buildExperienceEntries,
  buildLanguageEntries,
  buildVolunteeringEntries,
  hasContent,
  joinNonEmpty,
  splitParagraphs,
  visibleLinks,
} from './helpers/section-content.helper';
export type {
  FactEntry,
  PortfolioLabels,
  PortfolioTemplateProps,
  TimelineEntry,
} from './types/renderer.types';
