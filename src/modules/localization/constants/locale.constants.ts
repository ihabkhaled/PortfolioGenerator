import { MARKETING_ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

export const APP_LOCALES = [
  'en',
  'ar',
  'fr',
  'de',
  'it',
  'zh',
  'ja',
  'th',
  'pt',
  'es',
  'hi',
  'fa',
  'ru',
] as const;

export const DEFAULT_LOCALE = 'en' as const;
export const RTL_LOCALES = ['ar', 'fa'] as const;

export const PLATFORM_ROUTE_SEGMENTS: readonly string[] = [
  'ads.txt',
  'api',
  'dashboard',
  'feed.xml',
  'forgot-password',
  'manifest.webmanifest',
  'media',
  'reset-password',
  'robots.txt',
  'sign-in',
  'sign-out',
  'sign-up',
  'sitemap.xml',
  ...Object.values(MARKETING_ROUTE_PATHS).map((path) => path.split('/').find(Boolean) ?? ''),
];
