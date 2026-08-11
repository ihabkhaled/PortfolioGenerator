'use client';
// client-boundary-reason: this reviewed facade owns location, clipboard and service-worker browser APIs.

import type {
  BrowserLocationSnapshot,
  BrowserInstallPromptListener,
  BrowserServiceWorkerUpdate,
  BrowserServiceWorkerUpdateListener,
} from './browser.types';

const NO_BROWSER_CLEANUP = (): void => undefined;
const PWA_INSTALL_DISMISSED_KEY = 'pwa-install-dismissed';

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
}

function toServiceWorkerUpdate(worker: ServiceWorker): BrowserServiceWorkerUpdate {
  return {
    activate: (): Promise<void> => {
      worker.postMessage({ type: 'SKIP_WAITING' });
      return Promise.resolve();
    },
  };
}

function observeServiceWorkerRegistration(
  registration: ServiceWorkerRegistration,
  onUpdate: BrowserServiceWorkerUpdateListener,
): () => void {
  let observedInstallingWorker: ServiceWorker | null = null;
  const reportWaitingWorker = (): void => {
    if (registration.waiting) onUpdate(toServiceWorkerUpdate(registration.waiting));
  };
  const reportInstalledWorker = (): void => {
    const worker = registration.installing;
    if (worker?.state === 'installed' && globalThis.navigator.serviceWorker.controller) {
      onUpdate(toServiceWorkerUpdate(worker));
    }
  };
  const observeInstallingWorker = (): void => {
    observedInstallingWorker = registration.installing;
    observedInstallingWorker?.addEventListener('statechange', reportInstalledWorker);
  };

  reportWaitingWorker();
  observeInstallingWorker();
  reportInstalledWorker();
  registration.addEventListener('updatefound', observeInstallingWorker);

  return (): void => {
    registration.removeEventListener('updatefound', observeInstallingWorker);
    observedInstallingWorker?.removeEventListener('statechange', reportInstalledWorker);
  };
}

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

export function observeBrowserServiceWorker(
  path: string,
  onUpdate: BrowserServiceWorkerUpdateListener,
): () => void {
  if (!('serviceWorker' in globalThis.navigator) || globalThis.location.hostname === 'localhost') {
    return NO_BROWSER_CLEANUP;
  }

  const serviceWorkers = globalThis.navigator.serviceWorker;
  let registrationCleanup = NO_BROWSER_CLEANUP;
  let observing = true;
  let hasController = serviceWorkers.controller !== null;
  const reloadOnControllerChange = (): void => {
    if (hasController) globalThis.location.reload();
    hasController = true;
  };
  const register = async (): Promise<void> => {
    try {
      const existingRegistration = await serviceWorkers.getRegistration('/');
      const registration =
        existingRegistration ?? (await serviceWorkers.register(path, { scope: '/' }));
      if (observing) {
        registrationCleanup = observeServiceWorkerRegistration(registration, onUpdate);
      }
      // Observe first: `update()` can synchronously start an install, and a
      // waiting/installing worker is already the update the UI must surface.
      // Starting another check here can supersede that exact worker before the
      // visitor has a chance to activate it.
      if (existingRegistration?.waiting === null && existingRegistration.installing === null) {
        await existingRegistration.update();
      }
    } catch {
      return;
    }
  };

  serviceWorkers.addEventListener('controllerchange', reloadOnControllerChange);
  void register();

  return (): void => {
    observing = false;
    registrationCleanup();
    serviceWorkers.removeEventListener('controllerchange', reloadOnControllerChange);
  };
}

/**
 * Whether this page is already running as the installed app.
 *
 * `display-mode: standalone` covers Chromium and Firefox; `navigator.standalone`
 * is Safari's own pre-standard flag on iOS, which never matches the media
 * query. Either one true means there is nothing left to install.
 */
export function isBrowserAppInstalled(): boolean {
  try {
    const nav = globalThis.navigator as Navigator & { standalone?: boolean };
    return globalThis.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
  } catch {
    return false;
  }
}

/**
 * Whether the visitor already dismissed the install prompt this session.
 *
 * `sessionStorage`, not `localStorage`: the prompt is worth offering again on
 * a fresh visit, just not repeatedly within the one the visitor is already in
 * — some browsers re-fire `beforeinstallprompt` on later navigations in the
 * same tab, which without this would reopen the banner the visitor just
 * closed.
 */
export function isBrowserInstallPromptDismissed(): boolean {
  try {
    return globalThis.sessionStorage.getItem(PWA_INSTALL_DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
}

export function dismissBrowserInstallPromptForSession(): void {
  try {
    globalThis.sessionStorage.setItem(PWA_INSTALL_DISMISSED_KEY, '1');
  } catch {
    // A visitor with storage disabled just sees the prompt again next render.
  }
}

export function observeBrowserInstallPrompt(onChange: BrowserInstallPromptListener): () => void {
  if (isBrowserAppInstalled() || isBrowserInstallPromptDismissed()) return NO_BROWSER_CLEANUP;

  const handlePrompt = (event: Event): void => {
    event.preventDefault();
    const installEvent = event as InstallPromptEvent;
    onChange({
      prompt: async (): Promise<void> => {
        try {
          await installEvent.prompt();
        } catch {
          // The browser owns this UI and may withdraw the prompt between the
          // event and the user's click. Dismissing our stale action is enough.
        } finally {
          onChange(null);
        }
      },
    });
  };
  const handleInstalled = (): void => {
    onChange(null);
  };

  globalThis.addEventListener('beforeinstallprompt', handlePrompt);
  globalThis.addEventListener('appinstalled', handleInstalled);

  return (): void => {
    globalThis.removeEventListener('beforeinstallprompt', handlePrompt);
    globalThis.removeEventListener('appinstalled', handleInstalled);
  };
}

export type { BrowserInstallPrompt, BrowserServiceWorkerUpdate } from './browser.types';
