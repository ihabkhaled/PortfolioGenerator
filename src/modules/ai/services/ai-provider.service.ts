import 'server-only';

import { getServerEnv } from '@/packages/env/server';

import { AI_PROVIDER_REGISTRY } from '../constants/ai-registry.constants';
import { createDeterministicAiProvider } from '../providers/deterministic-ai.provider';
import { createModelAiProvider } from '../providers/model-ai.provider';
import type { PortfolioAiProvider } from '../types/ai-provider.types';

/**
 * Selects the extraction provider from configuration.
 *
 * `deterministic` is the default, which is the safe direction to fail: a
 * deployment that forgets to configure a model produces rougher imports rather
 * than an unexpected bill, and CI cannot reach a paid endpoint by accident.
 */
export function getAiProvider(): PortfolioAiProvider {
  if (AI_PROVIDER_REGISTRY.value) {
    return AI_PROVIDER_REGISTRY.value;
  }

  const provider =
    getServerEnv().AI_PROVIDER === 'openai-compatible'
      ? createModelAiProvider()
      : createDeterministicAiProvider();

  AI_PROVIDER_REGISTRY.value = provider;

  return provider;
}

/** Test hook: substitute a provider, or clear the selection. */
export function setAiProvider(provider: PortfolioAiProvider | null): void {
  AI_PROVIDER_REGISTRY.value = provider;
}
