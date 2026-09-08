import { describe, expect, it } from 'vitest';

import { resolveModelChain, selectChainModel } from '../helpers/model-chain.helper';

/**
 * The chain is the difference between one model's bad day and a failed import,
 * so its precedence and bounds are worth pinning down exactly.
 */
describe('resolveModelChain', () => {
  it('uses the configured chain in the order it was written', () => {
    expect(resolveModelChain('a,b,c', 'primary', 'fallback')).toEqual(['a', 'b', 'c']);
  });

  it('falls back to the primary and fallback pair when no chain is set', () => {
    expect(resolveModelChain(undefined, 'primary', 'fallback')).toEqual(['primary', 'fallback']);
    expect(resolveModelChain('', 'primary', 'fallback')).toEqual(['primary', 'fallback']);
  });

  it('survives the punctuation a dashboard field collects', () => {
    expect(resolveModelChain(' a , , b ,', 'primary', 'fallback')).toEqual(['a', 'b']);
  });

  it('drops a repeated model, which could not answer differently', () => {
    expect(resolveModelChain('a,b,a', 'primary', 'fallback')).toEqual(['a', 'b']);
    expect(resolveModelChain(undefined, 'same', 'same')).toEqual(['same']);
  });
});

describe('selectChainModel', () => {
  it('returns the model at the position asked for', () => {
    expect(selectChainModel(['a', 'b', 'c'], 1)).toBe('b');
  });

  it('clamps past either end rather than answering with no model at all', () => {
    expect(selectChainModel(['a', 'b'], 9)).toBe('b');
    expect(selectChainModel(['a', 'b'], -1)).toBe('a');
  });

  it('answers an empty chain with an empty model rather than throwing', () => {
    expect(selectChainModel([], 0)).toBe('');
  });
});
