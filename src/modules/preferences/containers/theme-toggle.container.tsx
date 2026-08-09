'use client';
// client-boundary-reason: the current theme is browser state, and switching it
// has to take effect without a round trip.

import type { ReactElement } from 'react';

import { MonitorIcon, MoonIcon, SunIcon } from '@/packages/icons';
import { useTheme } from '@/packages/theme';
import type { ThemePreference } from '@/packages/theme';
import { cn } from '@/packages/ui-primitives';

import { preferencesClasses } from '../constants/preferences-style.constants';
import type { ThemeToggleProps } from '../types/preferences.types';

/**
 * Three states, not two.
 *
 * A two-way toggle forces a reader who has set their OS to switch at sunset to
 * pick a side and stay there. `System` is the default and stays available.
 *
 * Rendered as a radio group so a screen reader announces it as one control with
 * three options rather than as three unrelated buttons.
 */
export function ThemeToggleContainer(props: Readonly<ThemeToggleProps>): ReactElement {
  const theme = useTheme();

  return (
    <div className={preferencesClasses.group} role="radiogroup" aria-label={props.label}>
      {props.options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={theme.preference === option.value}
          aria-label={option.label}
          title={option.label}
          className={cn(
            preferencesClasses.option,
            theme.preference === option.value ? preferencesClasses.optionActive : undefined,
          )}
          onClick={() => {
            theme.setPreference(option.value);
          }}
        >
          {renderThemeIcon(option.value)}
        </button>
      ))}
    </div>
  );
}

function renderThemeIcon(preference: ThemePreference): ReactElement {
  if (preference === 'light') {
    return <SunIcon aria-hidden size={15} />;
  }

  if (preference === 'dark') {
    return <MoonIcon aria-hidden size={15} />;
  }

  return <MonitorIcon aria-hidden size={15} />;
}
