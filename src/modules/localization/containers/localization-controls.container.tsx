'use client';
// client-boundary-reason: language navigation and clipboard access are browser-owned interactions.

import { useEffect, useState } from 'react';
import type { ChangeEvent, ReactElement } from 'react';

import { copyBrowserText, getBrowserLocation, navigateBrowser } from '@/packages/browser';
import { Button, Select } from '@/packages/ui-primitives';

import { localizationClasses } from '../constants/localization-style.constants';
import {
  isAppLocale,
  isPublicPortfolioCandidatePath,
  localizePath,
} from '../helpers/locale-path.helper';
import type { LocalizationControlsProps } from '../types/localization-view.types';

function changeLocale(event: ChangeEvent<HTMLSelectElement>): void {
  const locale = event.currentTarget.value;
  if (!isAppLocale(locale)) return;
  const location = getBrowserLocation();
  const pathname = localizePath(location.pathname, locale);
  navigateBrowser(`${pathname}${location.search}${location.hash}`);
}

export function LocalizationControlsContainer(
  props: Readonly<LocalizationControlsProps>,
): ReactElement {
  const [copyVisible, setCopyVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    setCopyVisible(isPublicPortfolioCandidatePath(getBrowserLocation().pathname));
  }, []);

  async function copyCurrentUrl(): Promise<void> {
    await copyBrowserText(getBrowserLocation().href);
    setCopied(true);
  }

  return (
    <aside
      className={localizationClasses.controls}
      aria-label={props.label}
      data-fixed-surface="locale"
    >
      <Select
        aria-label={props.label}
        value={props.locale}
        onChange={changeLocale}
        className={localizationClasses.select}
      >
        {props.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      {copyVisible ? (
        <Button type="button" variant="secondary" size="sm" onClick={() => void copyCurrentUrl()}>
          {copied ? props.copied : props.copyUrl}
        </Button>
      ) : null}
    </aside>
  );
}
