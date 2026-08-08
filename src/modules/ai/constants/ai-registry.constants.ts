import type { PortfolioAiProvider } from '../types/ai-provider.types';

/** The process-wide slot holding the configured extraction provider. */
export const AI_PROVIDER_REGISTRY: { value: PortfolioAiProvider | null } = { value: null };
