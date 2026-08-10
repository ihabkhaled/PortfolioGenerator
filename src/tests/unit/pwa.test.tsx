import { readFileSync } from 'node:fs';

import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import manifest from '@/app/manifest';
import { PwaRegistrationContainer } from '@/modules/pwa/pwa-ui';
import type { BrowserInstallPrompt, BrowserServiceWorkerUpdate } from '@/packages/browser';

const browser = vi.hoisted(() => ({
  cleanup: vi.fn(),
  installCleanup: vi.fn(),
  observe: vi.fn(),
  observeInstall: vi.fn(),
  installListener: null as ((prompt: BrowserInstallPrompt | null) => void) | null,
  updateListener: null as ((update: BrowserServiceWorkerUpdate) => void) | null,
}));

vi.mock('@/packages/browser', () => ({
  observeBrowserInstallPrompt: (listener: (prompt: BrowserInstallPrompt | null) => void) => {
    browser.observeInstall();
    browser.installListener = listener;
    return browser.installCleanup;
  },
  observeBrowserServiceWorker: (
    path: string,
    listener: (update: BrowserServiceWorkerUpdate) => void,
  ): (() => void) => {
    browser.observe(path);
    browser.updateListener = listener;
    return browser.cleanup;
  },
}));

beforeEach(() => {
  browser.cleanup.mockReset();
  browser.installCleanup.mockReset();
  browser.observe.mockReset();
  browser.observeInstall.mockReset();
  browser.installListener = null;
  browser.updateListener = null;
});

describe('PWA boundaries', () => {
  it('publishes an installable standalone manifest', async () => {
    const result = await manifest();
    const icons = result.icons ?? [];

    expect(result.start_url).toBe('/');
    expect(result.display).toBe('standalone');
    expect(icons.some((icon) => icon.sizes === '192x192')).toBe(true);
    expect(icons.some((icon) => icon.sizes === '512x512' && icon.purpose === 'maskable')).toBe(
      true,
    );
  });

  it('keeps sensitive route families out of the service-worker cache allowlist', () => {
    const worker = readFileSync('public/sw.js', 'utf8');

    expect(worker).not.toMatch(/startsWith\('\/(dashboard|api|media|sign-in|sign-up)/);
    expect(worker).toContain("url.pathname.startsWith('/guides/')");
    expect(worker).toContain("url.pathname.startsWith('/_next/static/')");
  });

  it('registers silently until an update is available and cleans up on unmount', () => {
    const view = render(
      <PwaRegistrationContainer
        installTitle="Install ProFolio"
        installDescription="Keep it ready on this device."
        installAction="Install"
        updateTitle="Update available"
        updateDescription="Refresh to use it."
        updateAction="Refresh"
        dismissLabel="Dismiss"
      />,
    );

    expect(browser.observe).toHaveBeenCalledWith('/sw.js');
    expect(screen.queryByRole('button', { name: 'Refresh' })).not.toBeInTheDocument();
    view.unmount();
    expect(browser.cleanup).toHaveBeenCalledOnce();
    expect(browser.installCleanup).toHaveBeenCalledOnce();
  });

  it('announces an available update and activates it on request', async () => {
    const activate = vi.fn().mockResolvedValue(undefined);
    render(
      <PwaRegistrationContainer
        installTitle="Install ProFolio"
        installDescription="Keep it ready on this device."
        installAction="Install"
        updateTitle="Update available"
        updateDescription="Refresh to use it."
        updateAction="Refresh"
        dismissLabel="Dismiss"
      />,
    );

    act(() => {
      browser.updateListener?.({ activate });
    });
    expect(screen.getByText('Update available')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(activate).toHaveBeenCalledOnce();
  });

  it('offers the browser install prompt when the app is installable', async () => {
    const prompt = vi.fn().mockResolvedValue(undefined);
    render(
      <PwaRegistrationContainer
        installTitle="Install ProFolio"
        installDescription="Keep it ready on this device."
        installAction="Install"
        updateTitle="Update available"
        updateDescription="Refresh to use it."
        updateAction="Refresh"
        dismissLabel="Dismiss"
      />,
    );

    act(() => {
      browser.installListener?.({ prompt });
    });
    await userEvent.click(screen.getByRole('button', { name: 'Install' }));
    expect(prompt).toHaveBeenCalledOnce();
  });

  it('dismisses the install banner with no update pending', async () => {
    const prompt = vi.fn().mockResolvedValue(undefined);
    render(
      <PwaRegistrationContainer
        installTitle="Install ProFolio"
        installDescription="Keep it ready on this device."
        installAction="Install"
        updateTitle="Update available"
        updateDescription="Refresh to use it."
        updateAction="Refresh"
        dismissLabel="Dismiss"
      />,
    );

    act(() => {
      browser.installListener?.({ prompt });
    });
    expect(screen.getByText('Install ProFolio')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(screen.queryByText('Install ProFolio')).not.toBeInTheDocument();
  });

  it('dismissing the update banner leaves a pending install prompt for later', async () => {
    const activate = vi.fn().mockResolvedValue(undefined);
    const prompt = vi.fn().mockResolvedValue(undefined);
    render(
      <PwaRegistrationContainer
        installTitle="Install ProFolio"
        installDescription="Keep it ready on this device."
        installAction="Install"
        updateTitle="Update available"
        updateDescription="Refresh to use it."
        updateAction="Refresh"
        dismissLabel="Dismiss"
      />,
    );

    act(() => {
      browser.installListener?.({ prompt });
      browser.updateListener?.({ activate });
    });
    expect(screen.getByText('Update available')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    // The update banner is gone, but the install prompt underneath it — a
    // `beforeinstallprompt` event that typically fires once per session —
    // must still be there to show next, not silently discarded with it.
    expect(screen.queryByText('Update available')).not.toBeInTheDocument();
    expect(screen.getByText('Install ProFolio')).toBeInTheDocument();
  });

  it('dismisses a browser prompt that is withdrawn before the user chooses it', async () => {
    const prompt = vi.fn().mockRejectedValue(new Error('prompt withdrawn'));
    render(
      <PwaRegistrationContainer
        installTitle="Install ProFolio"
        installDescription="Keep it ready on this device."
        installAction="Install"
        updateTitle="Update available"
        updateDescription="Refresh to use it."
        updateAction="Refresh"
        dismissLabel="Dismiss"
      />,
    );

    act(() => {
      browser.installListener?.({ prompt });
    });
    await userEvent.click(screen.getByRole('button', { name: 'Install' }));
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Install' })).not.toBeInTheDocument();
    });
  });
});
