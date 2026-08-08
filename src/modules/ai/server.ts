import 'server-only';

/** Server-only surface: the configured provider. */

export { createModelAiProvider } from './providers/model-ai.provider';
export { recordAiRun } from './repositories/ai-run.repository';
export { getAiProvider, setAiProvider } from './services/ai-provider.service';
export { extractResumeToDraft } from './services/resume-extraction.service';
export type { ExtractionOutcome, ExtractionRequest } from './types/extraction-service.types';
export type { AiRunInput, AiRunStatus } from './types/ai-run.types';
