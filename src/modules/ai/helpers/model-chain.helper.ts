/**
 * The ordered list of models one extraction may try.
 *
 * Pure, and given its inputs rather than reading the environment, so the
 * precedence rule is testable on its own: an explicit chain wins, and a
 * deployment that never set one still gets the primary-then-fallback pair it
 * has always had.
 *
 * Blank entries are dropped rather than rejected — a trailing comma in a
 * dashboard field should not take extraction down — and duplicates are removed
 * because retrying the identical model is a call that cannot answer differently.
 */
export function resolveModelChain(
  chain: string | undefined,
  primaryModel: string,
  fallbackModel: string,
): readonly string[] {
  const configured = (chain ?? '')
    .split(',')
    .map((model) => model.trim())
    .filter((model) => model !== '');

  const models = configured.length > 0 ? configured : [primaryModel, fallbackModel];

  return [...new Set(models)];
}

/**
 * The model at a position in the chain, clamped to its end.
 *
 * Clamped rather than undefined-on-overflow: an attempt counter that outruns a
 * short chain should repeat the last model, not fail with no model at all.
 */
export function selectChainModel(chain: readonly string[], index: number): string {
  const clamped = Math.min(Math.max(index, 0), chain.length - 1);

  return chain[clamped] ?? '';
}
