import { readFileSync } from 'node:fs';

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import manifest from '@/app/manifest';
import { PwaRegistrationContainer } from '@/modules/pwa/pwa-ui';
import type { BrowserServiceWorkerUpdate } from '@/packages/browser';

const browser = vi.hoisted(() => ({
  cleanup: vi.fn(),
  observe: vi.fn(),
  updateListener: null as ((update: BrowserServiceWorkerUpdate) => void) | null,
}));

vi.mock('@/packages/browser', () => ({
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
  browser.observe.mockReset();
  browser.updateListener = null;
});

describe('PWA boundaries', () => {
  it('publishes an installable standalone manifest', async () => {
    await expect(manifest()).resolves.toMatchObject({ start_url: '/', display: 'standalone' });
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
        updateTitle="Update available"
        updateDescription="Refresh to use it."
        updateAction="Refresh"
      />,
    );

    expect(browser.observe).toHaveBeenCalledWith('/sw.js');
    expect(screen.queryByRole('button', { name: 'Refresh' })).not.toBeInTheDocument();
    view.unmount();
    expect(browser.cleanup).toHaveBeenCalledOnce();
  });

  it('announces an available update and activates it on request', async () => {
    const activate = vi.fn();
    render(
      <PwaRegistrationContainer
        updateTitle="Update available"
        updateDescription="Refresh to use it."
        updateAction="Refresh"
      />,
    );

    act(() => {
      browser.updateListener?.({ activate });
    });
    expect(screen.getByText('Update available')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(activate).toHaveBeenCalledOnce();
  });
});
