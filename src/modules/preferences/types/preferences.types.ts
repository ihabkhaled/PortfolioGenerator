import type { ThemePreference } from '@/packages/theme';

export interface ThemeOption {
  readonly value: ThemePreference;
  readonly label: string;
}

export interface ThemeToggleProps {
  readonly label: string;
  readonly options: readonly ThemeOption[];
}
