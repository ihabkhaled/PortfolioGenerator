import { describe, expect, it } from 'vitest';

import {
  buildContentSecurityPolicy,
  buildLocaleRewriteUrl,
  resolveCrossOriginOpenerPolicy,
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
    expect(policy).toContain('https://www.google.com');
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("frame-ancestors 'none'");
  });

  it('allows only PayPal checkout origins required by the official SDK', () => {
    const ordinaryPolicy = buildContentSecurityPolicy('ordinary-nonce', false);
    expect(ordinaryPolicy).not.toContain('paypal.com');
    expect(ordinaryPolicy).not.toContain('paypalobjects.com');
    expect(ordinaryPolicy).not.toContain('venmo.com');

    const policy = buildContentSecurityPolicy('checkout-nonce', false, true);
    const directives = policy.split('; ');

    for (const directiveName of [
      'child-src',
      'connect-src',
      'frame-src',
      'img-src',
      'script-src',
      'style-src',
    ]) {
      const directive = directives.find((value) => value.startsWith(`${directiveName} `));
      expect(directive).toBeDefined();
      for (const origin of [
        'https://*.paypal.com',
        'https://*.paypalobjects.com',
        'https://*.venmo.com',
      ]) {
        expect(directive).toContain(origin);
      }
    }
  });

  it('allows PayPal checkout popups only on the localized settings route', () => {
    expect(resolveCrossOriginOpenerPolicy('/dashboard/settings')).toBe('same-origin-allow-popups');
    expect(resolveCrossOriginOpenerPolicy('/fr/dashboard/settings')).toBe(
      'same-origin-allow-popups',
    );
    expect(resolveCrossOriginOpenerPolicy('/dashboard')).toBe('same-origin');
  });

  it('the managawy policy has no AdSense or PayPal allowances', () => {
    const policy = buildContentSecurityPolicy('test-nonce', false, false, true);

    expect(policy).not.toContain('googlesyndication');
    expect(policy).not.toContain('paypal.com');
    expect(policy).toContain("script-src 'self' 'nonce-test-nonce' 'strict-dynamic'");
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
