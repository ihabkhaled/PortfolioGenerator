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

/**
 * Selects the provider that translates stored portfolio content.
 *
 * Separate from `getAiProvider` because translation is a separate decision.
 * Extraction may be left deterministic — offline, free, and good enough for a
 * first draft — while translation still needs a real model, and a deployment
 * that made that choice should not have to turn extraction on to get it.
 *
 * The Google key alone decides it: if it is set, translation runs on Google AI
 * regardless of `AI_PROVIDER`; if it is not, translation follows extraction and
 * fails as "not configured" rather than inventing text in the wrong language.
 */
export function getTranslationProvider(): PortfolioAiProvider {
  // A substituted provider still wins, so a test that installs a fake gets it
  // for both paths.
  if (AI_PROVIDER_REGISTRY.value) {
    return AI_PROVIDER_REGISTRY.value;
  }

  return getServerEnv().AI_GOOGLE_API_KEY === undefined
    ? getAiProvider()
    : createModelAiProvider();
}

/** Test hook: substitute a provider, or clear the selection. */
export function setAiProvider(provider: PortfolioAiProvider | null): void {
  AI_PROVIDER_REGISTRY.value = provider;
}
