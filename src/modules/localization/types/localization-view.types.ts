import type { AppLocale } from './locale.types';
import type { TranslationSnapshot } from './translation.types';

export interface LocaleOption {
  readonly value: AppLocale;
  readonly label: string;
}

export interface LocalizationControlsProps {
  readonly locale: AppLocale;
  readonly options: readonly LocaleOption[];
  readonly label: string;
  readonly copyUrl: string;
  readonly shareUrl: string;
  readonly copied: string;
  readonly showLocale?: boolean;
  readonly showReaderActions?: boolean;
}

export interface TranslationPanelProps {
  readonly portfolioId: string;
  readonly localeOptions: readonly LocaleOption[];
  readonly snapshots: readonly TranslationSnapshot[];
}
