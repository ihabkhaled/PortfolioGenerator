import { describe, expect, it } from 'vitest';

import {
  APP_LOCALES,
  buildLocaleRewrite,
  getLocaleDirection,
  localizePath,
  isPublicPortfolioCandidatePath,
  resolveLocalePath,
} from '@/modules/localization';

describe('locale routing', () => {
  it('keeps the root URL as implicit English', () => {
    expect(resolveLocalePath('/')).toEqual({ locale: 'en', pathname: '/', explicit: false });
  });

  it('normalizes a path without a leading slash', () => {
    expect(resolveLocalePath('ihabkhaled/about')).toEqual({
      locale: 'en',
      pathname: '/ihabkhaled/about',
      explicit: false,
    });
  });

  it('resolves a locale-only URL to the canonical root', () => {
    expect(resolveLocalePath('/fr')).toEqual({ locale: 'fr', pathname: '/', explicit: true });
  });

  it.each(APP_LOCALES)('resolves the explicit %s prefix', (locale) => {
    expect(resolveLocalePath(`/${locale}/ihabkhaled/about`)).toEqual({
      locale,
      pathname: '/ihabkhaled/about',
      explicit: true,
    });
  });

  it('does not consume an unsupported first segment that may be a portfolio slug', () => {
    expect(resolveLocalePath('/ihabkhaled')).toEqual({
      locale: 'en',
      pathname: '/ihabkhaled',
      explicit: false,
    });
  });

  it('builds stable language-switch URLs without duplicating prefixes', () => {
    expect(localizePath('/ar/ihabkhaled/about', 'fr')).toBe('/fr/ihabkhaled/about');
    expect(localizePath('/', 'en')).toBe('/en');
  });

  it.each(['ar', 'fa'] as const)('marks %s as right-to-left', (locale) => {
    expect(getLocaleDirection(locale)).toBe('rtl');
  });

  it('marks English as left-to-right', () => {
    expect(getLocaleDirection('en')).toBe('ltr');
  });

  it('rewrites an explicit localized portfolio path to the canonical route', () => {
    expect(buildLocaleRewrite('/ar/ihabkhaled/about')).toEqual({
      locale: 'ar',
      pathname: '/ihabkhaled/about',
    });
  });

  it('does not rewrite implicit English or platform infrastructure paths', () => {
    expect(buildLocaleRewrite('/ihabkhaled')).toBeNull();
    expect(buildLocaleRewrite('/api/contact')).toBeNull();
    expect(buildLocaleRewrite('/_next/static/file.js')).toBeNull();
  });

  it('recognizes localized and unprefixed public portfolio paths', () => {
    expect(isPublicPortfolioCandidatePath('/ihabkhaled')).toBe(true);
    expect(isPublicPortfolioCandidatePath('/portfolios/ihabkhaled')).toBe(true);
    expect(isPublicPortfolioCandidatePath('/ar/portfolios/ihabkhaled/about')).toBe(true);
    expect(isPublicPortfolioCandidatePath('/ar/ihabkhaled/about')).toBe(true);
    expect(isPublicPortfolioCandidatePath('/ar/sign-in')).toBe(false);
    expect(isPublicPortfolioCandidatePath('/')).toBe(false);
  });

  /**
   * Each of these was observed in production as a database query for a
   * portfolio slug that could never exist: the proxy's matcher excludes
   * _next/static but not the service worker or the PWA icons, and the platform
   * segment list did not name them either.
   */
  it.each(['/sw.js', '/icon-512.png', '/apple-touch-icon.png', '/icon-maskable-512.png'])(
    'does not treat the asset %s as a portfolio slug',
    (path) => {
      expect(isPublicPortfolioCandidatePath(path)).toBe(false);
    },
  );

  it('rejects a first segment that could not be a slug', () => {
    expect(isPublicPortfolioCandidatePath('/Not-A-Slug')).toBe(false);
    expect(isPublicPortfolioCandidatePath('/double--hyphen')).toBe(false);
    expect(isPublicPortfolioCandidatePath('/-leading')).toBe(false);
  });

  it('still recognizes a real slug, including under a locale prefix', () => {
    expect(isPublicPortfolioCandidatePath('/ihab-regression-20260815')).toBe(true);
    expect(isPublicPortfolioCandidatePath('/ar/ihab-regression-20260815')).toBe(true);
  });
});
