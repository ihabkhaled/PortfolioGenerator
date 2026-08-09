/** Public surface of the ai module (pure mapping, schemas and types). */

export {
  AI_OPERATIONS,
  EXTRACTION_LIMITS,
  MAX_EXTRACTION_ATTEMPTS,
  WARNING_CODES,
} from './constants/extraction.constants';
export { RESUME_EXTRACTION_SYSTEM_PROMPT } from './constants/extraction-prompt.constants';
export { PORTFOLIO_TRANSLATION_SYSTEM_PROMPT } from './constants/translation-prompt.constants';
export { DEFAULT_SKILL_GROUP_LABEL, LINK_LABELS } from './constants/mapping.constants';
export { parseDeterministicResume } from './helpers/deterministic-extraction.helper';
export { wrapResumeText } from './helpers/resume-envelope.helper';
export {
  dropIncompleteEntries,
  mapExperience,
  mapExtractionToDocument,
  mapLinks,
  mapProjects,
  mapSkills,
  normalizeMonth,
} from './mappers/extraction-to-document.mapper';
export { isRetryable, shouldEscalate, toAiRunStatus } from './policies/ai-run-status.policy';
export { createDeterministicAiProvider } from './providers/deterministic-ai.provider';
export { resumeExtractionSchema } from './schemas/resume-extraction.schema';
export type {
  AiErrorCode,
  AiOutcome,
  AiUsage,
  PortfolioAiProvider,
  PortfolioTranslationInput,
  ResumeExtractionInput,
  ResumeExtractionResult,
} from './types/ai-provider.types';
export type { ExtractionMappingResult } from './types/mapping.types';
