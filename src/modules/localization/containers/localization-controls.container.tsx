'use client';
// client-boundary-reason: language navigation and clipboard access are browser-owned interactions.

import { useEffect, useState } from 'react';
import type { ChangeEvent, ReactElement } from 'react';
import { createPortal } from 'react-dom';

import {
  copyBrowserText,
  getBrowserLocation,
  navigateBrowser,
  shareBrowserUrl,
} from '@/packages/browser';
import { CopyIcon, ShareIcon } from '@/packages/icons';
import { Button, Select } from '@/packages/ui-primitives';
import { LOCALIZATION_CONTROLS_TARGET_ID } from '@/shared/constants/localization-target.constants';

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
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setCopyVisible(isPublicPortfolioCandidatePath(getBrowserLocation().pathname));
    setTarget(
      globalThis.document.querySelector<HTMLElement>(`#${LOCALIZATION_CONTROLS_TARGET_ID}`) ??
        globalThis.document.body,
    );
  }, []);

  async function copyCurrentUrl(): Promise<void> {
    await copyBrowserText(getBrowserLocation().href);
    setCopied(true);
  }

  async function shareCurrentUrl(): Promise<void> {
    const location = getBrowserLocation();
    const shared = await shareBrowserUrl(location.href);
    if (!shared) await copyCurrentUrl();
  }

  if (target === null) return <span hidden />;

  return createPortal(
    <aside
      className={localizationClasses.controlsHeader}
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
          <CopyIcon aria-hidden size={14} />
          {copied ? props.copied : props.copyUrl}
        </Button>
      ) : null}
      {copyVisible ? (
        <Button type="button" variant="secondary" size="sm" onClick={() => void shareCurrentUrl()}>
          <ShareIcon aria-hidden size={14} />
          {props.shareUrl}
        </Button>
      ) : null}
    </aside>,
    target,
  );
}
