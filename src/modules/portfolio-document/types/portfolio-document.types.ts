import type { z } from '@/packages/zod';

import type {
  CUSTOM_BLOCK_KINDS,
  SECTION_TYPES,
  SOURCE_KINDS,
  THEME_ACCENTS,
  THEME_MODES,
} from '../constants/portfolio-document.constants';
import type {
  awardSchema,
  certificationSchema,
  customBlockSchema,
  educationSchema,
  experienceSchema,
  languageSchema,
  linkSchema,
  pageSchema,
  portfolioDocumentSchema,
  projectSchema,
  sectionSchema,
  skillGroupSchema,
} from '../schemas/portfolio-document.schema';

export type PortfolioDocument = z.infer<typeof portfolioDocumentSchema>;
export type PortfolioPage = z.infer<typeof pageSchema>;
export type PortfolioSection = z.infer<typeof sectionSchema>;
export type PortfolioLink = z.infer<typeof linkSchema>;
export type PortfolioExperience = z.infer<typeof experienceSchema>;
export type PortfolioProject = z.infer<typeof projectSchema>;
export type PortfolioSkillGroup = z.infer<typeof skillGroupSchema>;
export type PortfolioEducation = z.infer<typeof educationSchema>;
export type PortfolioCertification = z.infer<typeof certificationSchema>;
export type PortfolioLanguage = z.infer<typeof languageSchema>;
export type PortfolioAward = z.infer<typeof awardSchema>;
export type PortfolioCustomBlock = z.infer<typeof customBlockSchema>;

export type SectionType = (typeof SECTION_TYPES)[number];
export type CustomBlockKind = (typeof CUSTOM_BLOCK_KINDS)[number];
export type ThemeMode = (typeof THEME_MODES)[number];
export type ThemeAccent = (typeof THEME_ACCENTS)[number];
export type PortfolioSourceKind = (typeof SOURCE_KINDS)[number];

/** Narrow a section of the union by its discriminant. */
export type SectionOfType<TType extends SectionType> = Extract<PortfolioSection, { type: TType }>;

/** A page and its visible sections, already ordered, ready to render. */
export interface ResolvedPortfolioPage {
  readonly page: PortfolioPage;
  readonly sections: readonly PortfolioSection[];
}

/** Navigation entry derived from visible pages. */
export interface PortfolioNavigationItem {
  readonly pageId: string;
  readonly slug: string;
  readonly label: string;
  readonly href: string;
  readonly isCurrent: boolean;
}
