import type { APP_LOCALES } from '../constants/locale.constants';

export type AppLocale = (typeof APP_LOCALES)[number];
export type LocaleDirection = 'ltr' | 'rtl';

export interface ResolvedLocalePath {
  readonly locale: AppLocale;
  readonly pathname: string;
  readonly explicit: boolean;
}

export interface LocaleRewrite {
  readonly locale: AppLocale;
  readonly pathname: string;
}
