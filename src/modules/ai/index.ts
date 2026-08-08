/** Public surface of the ai module (pure mapping, schemas and types). */

export {
  AI_OPERATIONS,
  EXTRACTION_LIMITS,
  MAX_EXTRACTION_ATTEMPTS,
  WARNING_CODES,
} from './constants/extraction.constants';
export { RESUME_EXTRACTION_SYSTEM_PROMPT } from './constants/extraction-prompt.constants';
export { DEFAULT_SKILL_GROUP_LABEL, LINK_LABELS } from './constants/mapping.constants';
export { parseDeterministicResume } from './helpers/deterministic-extraction.helper';
export {
  dropIncompleteEntries,
  mapExperience,
  mapExtractionToDocument,
  mapLinks,
  mapProjects,
  mapSkills,
  normalizeMonth,
} from './mappers/extraction-to-document.mapper';
export { createDeterministicAiProvider } from './providers/deterministic-ai.provider';
export { resumeExtractionSchema } from './schemas/resume-extraction.schema';
export type {
  AiErrorCode,
  AiOutcome,
  AiUsage,
  PortfolioAiProvider,
  ResumeExtractionInput,
  ResumeExtractionResult,
} from './types/ai-provider.types';
export type { ExtractionMappingResult } from './types/mapping.types';
