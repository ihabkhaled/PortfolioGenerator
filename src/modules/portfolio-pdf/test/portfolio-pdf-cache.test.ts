import { describe, expect, it } from 'vitest';

import { buildFullPortfolioDocument } from '@/tests/fixtures/portfolio-document.fixtures';

import { redisCacheBytesKey, redisCacheMetaKey } from '../policies/portfolio-pdf-cache-key.policy';
import {
  hashPortfolioDocument,
  hasPortfolioContentChanged,
} from '../policies/portfolio-pdf-hash.policy';

describe('redisCacheBytesKey / redisCacheMetaKey', () => {
  it('namespaces bytes and metadata separately, keyed by portfolio id', () => {
    expect(redisCacheBytesKey('portfolio-1')).toBe('pdf:cache:bytes:portfolio-1');
    expect(redisCacheMetaKey('portfolio-1')).toBe('pdf:cache:meta:portfolio-1');
  });

  it('never collides bytes and meta keys for the same portfolio', () => {
    expect(redisCacheBytesKey('portfolio-1')).not.toBe(redisCacheMetaKey('portfolio-1'));
  });
});

describe('hashPortfolioDocument', () => {
  it('is deterministic for the same document', () => {
    const document = buildFullPortfolioDocument();

    expect(hashPortfolioDocument(document)).toBe(hashPortfolioDocument(document));
  });

  it('is stable across two structurally equal documents built independently', () => {
    expect(hashPortfolioDocument(buildFullPortfolioDocument())).toBe(
      hashPortfolioDocument(buildFullPortfolioDocument()),
    );
  });

  it('changes when any field changes', () => {
    const original = buildFullPortfolioDocument();
    const edited = { ...original, identity: { ...original.identity, headline: 'New headline' } };

    expect(hashPortfolioDocument(original)).not.toBe(hashPortfolioDocument(edited));
  });

  it('produces a hex sha-256 digest', () => {
    expect(hashPortfolioDocument(buildFullPortfolioDocument())).toMatch(/^[a-f0-9]{64}$/u);
  });
});

describe('hasPortfolioContentChanged', () => {
  it('reports no change for identical hashes', () => {
    expect(hasPortfolioContentChanged('abc', 'abc')).toBe(false);
  });

  it('reports a change for different hashes', () => {
    expect(hasPortfolioContentChanged('abc', 'def')).toBe(true);
  });
});
