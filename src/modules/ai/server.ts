import 'server-only';

/** Server-only surface: the configured provider. */

export { createModelAiProvider } from './providers/model-ai.provider';
export { getAiProvider, setAiProvider } from './services/ai-provider.service';
