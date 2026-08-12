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
});
