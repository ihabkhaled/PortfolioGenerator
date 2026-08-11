import { describe, expect, it } from 'vitest';

import {
  buildContentSecurityPolicy,
  buildLocaleRewriteUrl,
  resolveDashboardEditorPortfolioId,
} from '@/proxy';

describe('proxy content security policy', () => {
  it('keeps nonce enforcement while allowing only the AdSense delivery origins', () => {
    const policy = buildContentSecurityPolicy('test-nonce', false);

    expect(policy).toContain("script-src 'self' 'nonce-test-nonce' 'strict-dynamic'");
    expect(policy).toContain('connect-src');
    expect(policy).toContain('https://pagead2.googlesyndication.com');
    expect(policy).toContain('https://googleads.g.doubleclick.net');
    expect(policy).toContain(
      'frame-src https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net',
    );
    expect(policy).toContain('https://tpc.googlesyndication.com');
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("frame-ancestors 'none'");
  });
});

describe('dashboard editor ownership route matching', () => {
  it('extracts only an exact editor portfolio segment, including localized routes', () => {
    expect(resolveDashboardEditorPortfolioId('/dashboard/portfolios/portfolio-1/editor')).toBe(
      'portfolio-1',
    );
    expect(resolveDashboardEditorPortfolioId('/fr/dashboard/portfolios/portfolio-2/editor')).toBe(
      'portfolio-2',
    );
    expect(resolveDashboardEditorPortfolioId('/dashboard/portfolios/portfolio-1')).toBeNull();
    expect(
      resolveDashboardEditorPortfolioId('/dashboard/portfolios/portfolio-1/editor/extra'),
    ).toBeNull();
  });
});

describe('localized proxy rewrites', () => {
  it('changes only the pathname and preserves query parameters', () => {
    expect(
      buildLocaleRewriteUrl(
        'https://example.com/ar/reset-password?token=opaque%2Btoken&utm_source=email',
        '/reset-password',
      ).href,
    ).toBe('https://example.com/reset-password?token=opaque%2Btoken&utm_source=email');
  });
});
