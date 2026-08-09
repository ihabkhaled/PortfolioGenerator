'use client';
// client-boundary-reason: this is the reviewed facade around browser location and clipboard APIs.

import type { BrowserLocationSnapshot } from './browser.types';

export function getBrowserLocation(): BrowserLocationSnapshot {
  const { pathname, search, hash, href } = globalThis.location;
  return { pathname, search, hash, href };
}

export function navigateBrowser(url: string): void {
  globalThis.location.assign(url);
}

export function copyBrowserText(value: string): Promise<void> {
  return globalThis.navigator.clipboard.writeText(value);
}
