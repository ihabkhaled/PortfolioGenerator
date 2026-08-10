import 'server-only';

import { chromium as playwrightChromium } from 'playwright-core';

import { getServerEnv } from '@/packages/env/server';

/**
 * Owner of `playwright-core` and `@sparticuz/chromium`.
 *
 * `playwright-core` ships no browser of its own — the point of "core" — so it
 * resolves whatever Chromium build it is pointed at. In development, CI and
 * the test suite that already is a real one: `@playwright/test` installs
 * Chromium for the E2E suite, pinned to the same minor version as
 * `playwright-core` here, and `playwright-core` finds it the same way the
 * full `playwright` package would, because both read the same
 * `browsers.json`. In production there is no such install and no system
 * package manager to lean on, so `@sparticuz/chromium` — a Chromium build
 * compiled for exactly this kind of serverless function — travels inside the
 * deployment and is loaded only when actually needed, keeping it out of every
 * bundle that never renders a PDF.
 *
 * `PDF_CHROMIUM_EXECUTABLE_PATH` is the escape hatch: a deployment that is not
 * Vercel, or that mounts its own Chromium, points at it directly and skips
 * both resolution paths.
 */

const NAVIGATION_TIMEOUT_MS = 30_000;

export interface PdfPrintSession {
  /** Navigate to a page already reachable over HTTP and print it to PDF bytes. */
  printUrl: (url: string) => Promise<Uint8Array>;
  close: () => Promise<void>;
}

interface ChromiumLaunchConfig {
  /** Omitted, not `undefined` — `exactOptionalPropertyTypes` treats the two differently, and playwright-core's own resolution only kicks in when the property is absent. */
  readonly executablePath?: string;
  readonly args: readonly string[];
}

async function resolveLaunchConfig(): Promise<ChromiumLaunchConfig> {
  const env = getServerEnv();

  if (env.PDF_CHROMIUM_EXECUTABLE_PATH) {
    return { executablePath: env.PDF_CHROMIUM_EXECUTABLE_PATH, args: [] };
  }

  if (env.NODE_ENV !== 'production') {
    return { args: [] };
  }

  const { default: chromium } = await import('@sparticuz/chromium');

  return { executablePath: await chromium.executablePath(), args: chromium.args };
}

export async function createPdfPrintSession(): Promise<PdfPrintSession> {
  const { executablePath, args } = await resolveLaunchConfig();
  const browser = await playwrightChromium.launch({
    ...(executablePath !== undefined && { executablePath }),
    args: [...args],
    headless: true,
  });

  return {
    async printUrl(url) {
      const page = await browser.newPage();

      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: NAVIGATION_TIMEOUT_MS });

        return await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: { top: '18mm', bottom: '18mm', left: '14mm', right: '14mm' },
        });
      } finally {
        await page.close();
      }
    },
    async close() {
      await browser.close();
    },
  };
}
