import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { expectResponsivePage } from '../accessibility/support/responsive-proof';

import {
  buildAccount,
  createPortfolio,
  openEditorDisclosure,
  openEditorPageEntries,
  saveEditor,
  signUp,
  submitEditorServerAction,
} from './support/accounts';
import { buildResumePdf } from './support/pdf.fixture';

interface PrivateMediaFixture {
  readonly challengePath: string;
  readonly mediaPath: string;
  readonly password: string;
}

async function waitForServiceWorkerControl(page: Page): Promise<void> {
  await page.evaluate(async () => globalThis.navigator.serviceWorker.ready);
  await expect
    .poll(() => page.evaluate(() => globalThis.navigator.serviceWorker.controller !== null))
    .toBe(true);
}

async function cachePaths(page: Page): Promise<readonly string[]> {
  return page.evaluate(async () => {
    const keys = await globalThis.caches.keys();
    const requests = await Promise.all(
      keys.map(async (key) => (await globalThis.caches.open(key)).keys()),
    );
    return requests.flat().map((request) => {
      const [pathname = ''] = request.url.replace(globalThis.location.origin, '').split('?', 1);
      return pathname;
    });
  });
}

async function expectUnavailableOffline(page: Page, paths: readonly string[]): Promise<void> {
  const results = await page.evaluate(
    async (targets) =>
      Promise.all(
        targets.map(async (path) => {
          try {
            await globalThis.fetch(path, { cache: 'no-store', credentials: 'include' });
            return 'served';
          } catch {
            return 'unavailable';
          }
        }),
      ),
    paths,
  );
  expect(results).toEqual(paths.map(() => 'unavailable'));
}

async function createPrivateMediaFixture(page: Page): Promise<PrivateMediaFixture> {
  const slug = await createPortfolio(page, 'PWA Private Media Owner');
  await page.getByLabel('Headline').fill('Security engineer');
  await page.getByLabel('Summary').fill('A reviewed private-media portfolio.');
  await openEditorDisclosure(page, 'Pages');
  await page.locator('#new-page-title').fill('Private notes');
  await page.locator('#new-page-nav').fill('Notes');
  await page.locator('#new-page-slug').fill('notes');
  await page.getByRole('button', { name: 'Add page' }).click();
  await openEditorDisclosure(page, 'Photos and downloads');
  await page.getByLabel('Downloadable file').setInputFiles({
    name: 'private-proof.pdf',
    mimeType: 'application/pdf',
    buffer: buildResumePdf(['Owner-approved exact-grant PWA proof']),
  });
  await page.getByLabel('Public download label').fill('Private proof');
  await page.getByRole('button', { name: 'Upload attachment' }).click();
  await page.getByLabel('Downloadable file: Notes').check();
  const visibilityId = await page.getByLabel('Show publicly').last().getAttribute('id');
  if (visibilityId === null) throw new Error('Expected an uploaded attachment visibility control');
  const password = 'exact private media grant';
  const assetId = visibilityId.replace('attachment-visible-attachment-', '');
  await saveEditor(page);
  await expect(page.getByText('Saved').first()).toBeVisible();
  await openEditorPageEntries(page);
  await page.getByLabel('Page access').last().selectOption('private');
  await page.getByLabel('Share password').last().fill(password);
  await submitEditorServerAction(
    page,
    page.getByRole('button', { name: 'Update page access' }).last(),
  );
  await submitEditorServerAction(page, page.getByRole('button', { name: 'Publish', exact: true }));
  await page.getByRole('button', { name: 'Unpublish' }).waitFor();

  return {
    challengePath: `/portfolios/${slug}/notes`,
    mediaPath: `/portfolios/${slug}/notes/media/${assetId}`,
    password,
  };
}

test('the manifest assets decode and a distinct worker version surfaces and activates an update', async ({
  page,
  request,
}) => {
  test.setTimeout(120_000);
  const manifestResponse = await request.get('/manifest.webmanifest');
  const manifest = (await manifestResponse.json()) as {
    readonly display?: string;
    readonly icons?: readonly { readonly purpose?: string; readonly sizes?: string }[];
    readonly start_url?: string;
  };
  expect(manifestResponse.status()).toBe(200);
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toBe('/');
  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ sizes: '192x192' }),
      expect.objectContaining({ sizes: '512x512', purpose: 'maskable' }),
    ]),
  );

  await page.goto('/');
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
    'content',
    /viewport-fit=cover/u,
  );
  const decodedImages = await page.evaluate(async () => {
    const expected = [
      ['/icon-192.png', 192, 192],
      ['/icon-512.png', 512, 512],
      ['/icon-maskable-512.png', 512, 512],
      ['/apple-touch-icon.png', 180, 180],
    ] as const;
    return Promise.all(
      expected.map(async ([source, expectedWidth, expectedHeight]) => {
        const image = new globalThis.Image();
        image.src = source;
        await image.decode();
        return {
          expectedHeight,
          expectedWidth,
          naturalHeight: image.naturalHeight,
          naturalWidth: image.naturalWidth,
        };
      }),
    );
  });
  for (const image of decodedImages) {
    expect(image.naturalWidth).toBe(image.expectedWidth);
    expect(image.naturalHeight).toBe(image.expectedHeight);
  }

  await waitForServiceWorkerControl(page);
  const updateVersion = 'round-one-browser-proof';
  const updateEvidence = await page.evaluate(async (version) => {
    const registration = await globalThis.navigator.serviceWorker.ready;
    const originalController = globalThis.navigator.serviceWorker.controller?.scriptURL ?? null;
    let updateFound = false;
    registration.addEventListener('updatefound', () => {
      updateFound = true;
    });
    const updatedRegistration = await globalThis.navigator.serviceWorker.register(
      `/sw.js?version=${version}`,
      { scope: '/' },
    );
    const worker = updatedRegistration.installing ?? updatedRegistration.waiting;
    if (worker !== null && worker.state !== 'installed') {
      await new Promise<void>((resolve) => {
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed') resolve();
        });
      });
    }
    return {
      originalController,
      updateFound,
      waitingScript: updatedRegistration.waiting?.scriptURL ?? null,
    };
  }, updateVersion);
  expect(updateEvidence.originalController).toMatch(/\/sw\.js$/u);
  expect(updateEvidence.updateFound).toBe(true);
  expect(updateEvidence.waitingScript).toContain(`/sw.js?version=${updateVersion}`);

  await page.reload();
  const refresh = page.getByRole('button', { name: 'Refresh' });
  await expect(refresh).toBeVisible();
  await expectResponsivePage(page);
  await refresh.click();
  await expect
    .poll(async () => {
      try {
        return await page.evaluate(() => globalThis.navigator.serviceWorker.controller?.scriptURL);
      } catch {
        // Controller activation deliberately navigates this page; retry while its context swaps.
        return null;
      }
    })
    .toContain(`/sw.js?version=${updateVersion}`);
});

test('the mobile install prompt leaves the dashboard Import CV action reachable at the bottom', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await signUp(page, buildAccount('pwa-obstruction'));
  await createPortfolio(page, 'PWA obstruction portfolio');
  await page.goto('/dashboard');

  await page.evaluate(() => {
    const EventConstructor = Reflect.get(globalThis, 'Event');
    const event = new EventConstructor('beforeinstallprompt', { cancelable: true }) as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
    };
    event.prompt = () => Promise.resolve();
    event.userChoice = Promise.resolve({ outcome: 'dismissed' });
    globalThis.dispatchEvent(event);
  });

  const prompt = page.locator('[data-fixed-surface="pwa"]');
  await expect(prompt).toBeVisible();
  const importCv = page.getByRole('link', { name: 'Import CV' });
  await expect(importCv).toBeVisible();
  await page.evaluate(() => {
    globalThis.scrollTo(0, globalThis.document.documentElement.scrollHeight);
  });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          globalThis.scrollY + globalThis.innerHeight >=
          globalThis.document.documentElement.scrollHeight - 1,
      ),
    )
    .toBe(true);

  const [promptTop, importBottom] = await Promise.all([
    prompt.evaluate((element) => element.getBoundingClientRect().top),
    importCv.evaluate((element) => element.getBoundingClientRect().bottom),
  ]);
  expect(promptTop).toBeGreaterThanOrEqual(importBottom);
  await importCv.click();
  await expect(page).toHaveURL(/\/dashboard\/portfolios\/[^/]+\/import$/u);
});

test('warmed authenticated, private challenge, and exact-grant media responses stay out of offline caches', async ({
  page,
  context,
  browser,
}) => {
  test.setTimeout(240_000);
  const account = buildAccount('pwa-private-cache');
  await signUp(page, account);
  const fixture = await createPrivateMediaFixture(page);
  await waitForServiceWorkerControl(page);

  const ownerWarm = await page.evaluate(async () => {
    const [dashboard, session] = await Promise.all([
      globalThis.fetch('/dashboard', { cache: 'no-store', credentials: 'include' }),
      globalThis.fetch('/api/auth/get-session', { cache: 'no-store', credentials: 'include' }),
    ]);
    return {
      dashboardStatus: dashboard.status,
      sessionBody: await session.text(),
      sessionStatus: session.status,
    };
  });
  expect(ownerWarm.dashboardStatus).toBe(200);
  expect(ownerWarm.sessionStatus).toBe(200);
  expect(ownerWarm.sessionBody).toContain(account.email);

  const visitor = await browser.newContext();
  const privatePage = await visitor.newPage();
  await privatePage.goto(fixture.challengePath);
  await expect(privatePage.getByRole('heading', { name: /this page is private/i })).toBeVisible();
  await waitForServiceWorkerControl(privatePage);
  const authWarm = await privatePage.evaluate(
    async () =>
      (await globalThis.fetch('/sign-in', { cache: 'no-store', credentials: 'include' })).status,
  );
  expect(authWarm).toBe(200);
  await privatePage.getByLabel('Password').fill(fixture.password);
  await privatePage.getByRole('button', { name: /open private page/i }).click();
  await expect(privatePage.getByRole('heading', { name: /this page is private/i })).toHaveCount(0);
  await expect(privatePage.getByRole('link', { name: /profolio home/i })).toBeVisible();
  const mediaStatus = await privatePage.evaluate(
    async (path) =>
      (await globalThis.fetch(path, { cache: 'no-store', credentials: 'include' })).status,
    fixture.mediaPath,
  );
  expect(mediaStatus).toBe(200);

  const ownerForbidden = ['/dashboard', '/api/auth/get-session'];
  const visitorForbidden = ['/sign-in', fixture.challengePath, fixture.mediaPath];
  const [ownerCached, visitorCached] = await Promise.all([
    cachePaths(page),
    cachePaths(privatePage),
  ]);
  for (const path of ownerForbidden) expect(ownerCached).not.toContain(path);
  for (const path of visitorForbidden) expect(visitorCached).not.toContain(path);

  await context.setOffline(true);
  await visitor.setOffline(true);
  await expectUnavailableOffline(page, ownerForbidden);
  await expectUnavailableOffline(privatePage, visitorForbidden);
  await visitor.close();
});

test('cached public navigation survives offline and an uncached guide renders the exact fallback', async ({
  page,
  context,
}) => {
  await page.goto('/offline');
  const offlineHeading = await page.getByRole('heading', { level: 1 }).textContent();
  expect(offlineHeading).not.toBeNull();
  await waitForServiceWorkerControl(page);
  await page.goto('/guides/accessibility');
  const guideHeading = await page.getByRole('heading', { level: 1 }).textContent();
  await expect
    .poll(async () =>
      page.evaluate(
        async () => (await globalThis.caches.match('/guides/accessibility')) !== undefined,
      ),
    )
    .toBe(true);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(guideHeading ?? '');
  await page.goto('/guides/security?uncached-offline-proof=round-one');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(offlineHeading ?? '');
});
