'use client';
// client-boundary-reason: this reviewed facade owns location, clipboard and service-worker browser APIs.

import type {
  BrowserLocationSnapshot,
  BrowserInstallPromptListener,
  BrowserServiceWorkerUpdate,
  BrowserServiceWorkerUpdateListener,
} from './browser.types';

const NO_BROWSER_CLEANUP = (): void => undefined;

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
  const reloadOnControllerChange = (): void => {
    globalThis.location.reload();
  };
  const register = async (): Promise<void> => {
    try {
      const registration = await serviceWorkers.register(path, { scope: '/' });
      if (observing) {
        registrationCleanup = observeServiceWorkerRegistration(registration, onUpdate);
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

export function observeBrowserInstallPrompt(onChange: BrowserInstallPromptListener): () => void {
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
