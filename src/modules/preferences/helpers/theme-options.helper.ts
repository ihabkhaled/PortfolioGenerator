import type { TranslateFunction } from '@/packages/i18n';
import { THEME_PREFERENCES } from '@/packages/theme';

import type { ThemeOption } from '../types/preferences.types';

/**
 * The switch's three options, labelled from the catalog.
 *
 * Built here rather than in the container so the labels resolve on the server
 * where the catalog already is, and the client component receives finished
 * strings — which is also what keeps the toggle renderable inside a published
 * portfolio without pulling the message layer into that bundle.
 */
export function buildThemeOptions(translate: TranslateFunction): readonly ThemeOption[] {
  return THEME_PREFERENCES.map((value) => ({ value, label: translate(`theme.${value}`) }));
}
