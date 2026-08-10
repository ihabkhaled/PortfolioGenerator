/**
 * Public surface of the portfolio-document module: the canonical schema, its
 * types, the defaults factory, page/section resolution, and the migration
 * entry point. Nothing outside this module may reach into its internals.
 */

export {
  CUSTOM_BLOCK_KINDS,
  DEFAULT_TEMPLATE_ID,
  DOCUMENT_COUNTS,
  DOCUMENT_LIMITS,
  HOME_PAGE_SLUG,
  MONTH_PATTERN,
  PAGE_SLUG_MAX_LENGTH,
  PORTFOLIO_SCHEMA_VERSION,
  SECTION_TYPES,
  SOCIAL_LINK_KINDS,
  SOURCE_KINDS,
  THEME_ACCENTS,
  THEME_MODES,
} from './constants/portfolio-document.constants';

export {
  createDefaultHomeSections,
  createEmptyPortfolioDocument,
} from './helpers/portfolio-document-defaults.helper';

export {
  deriveSocialLinks,
  isRecord,
  upgradeContact,
  upgradeDocumentToVersion2,
  upgradeIdentity,
  upgradePages,
  upgradeProjects,
  upgradeSkills,
} from './helpers/portfolio-document-v2.migration';

export { upgradeDocumentToVersion3 } from './helpers/portfolio-document-v3.migration';

export {
  applyMigrationSteps,
  migratePortfolioDocument,
  readSchemaVersion,
  tryMigratePortfolioDocument,
  upgradeToCurrentVersion,
} from './helpers/portfolio-document-migration.helper';

export {
  buildNavigation,
  buildPublicNavigation,
  buildPageHref,
  findVisiblePage,
  findPublicPage,
  resolvePageSlug,
  sortVisiblePages,
  sortVisibleSections,
} from './helpers/portfolio-page-resolver.helper';

export {
  pageSchema,
  portfolioDocumentSchema,
  sectionSchema,
} from './schemas/portfolio-document.schema';

export type {
  CustomBlockKind,
  PortfolioAward,
  PortfolioCertification,
  PortfolioCustomBlock,
  PortfolioDocument,
  PortfolioEducation,
  PortfolioExperience,
  PortfolioLanguage,
  PortfolioLink,
  PortfolioNavigationItem,
  PortfolioPage,
  PortfolioProject,
  PortfolioSection,
  PortfolioSkillGroup,
  PortfolioSourceKind,
  ResolvedPortfolioPage,
  SectionOfType,
  SectionType,
  ThemeAccent,
  ThemeMode,
} from './types/portfolio-document.types';
