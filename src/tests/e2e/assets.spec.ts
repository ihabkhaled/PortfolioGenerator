import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { expect, test } from '@playwright/test';

import {
  buildAccount,
  createPortfolio,
  openEditorDisclosure,
  saveEditor,
  signUp,
} from './support/accounts';

const PORTRAIT_FIXTURE = path.resolve('public/icon-maskable-512.png');

function requireValue(value: string | null, message: string): string {
  if (value === null) throw new Error(message);
  return value;
}

test.describe('owned portrait assets', () => {
  test('scans, stores, publishes and serves a referenced portrait', async ({ page, request }) => {
    const account = buildAccount('portrait');

    await signUp(page, account);
    const slug = await createPortfolio(page, 'Portrait Owner');
    await openEditorDisclosure(page, 'Photos and downloads');

    await page.getByLabel('Portrait image').setInputFiles({
      name: 'portrait.png',
      mimeType: 'image/png',
      buffer: await readFile(PORTRAIT_FIXTURE),
    });
    await page.getByRole('button', { name: 'Use this framing' }).click();
    await page.getByRole('button', { name: 'Upload portrait' }).click();
    await expect(page.getByText(/portrait uploaded/i)).toBeVisible();

    await page.getByLabel('Headline').fill('Platform engineer');
    await page.getByLabel('Summary').fill('A portfolio with an owner-approved portrait.');
    await saveEditor(page);
    await page.getByText('Saved').first().waitFor();
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    await page.getByRole('button', { name: 'Unpublish' }).waitFor();

    await page.goto(`/portfolios/${slug}`);
    const image = page.getByRole('img', { name: 'Portrait' });

    await expect(image).toBeVisible();

    const optimizedSource = requireValue(
      await image.getAttribute('src'),
      'Expected the published portrait to have an image source',
    );
    const directPath = requireValue(
      new URL(optimizedSource, page.url()).searchParams.get('url'),
      'Expected Next Image to retain the owned media path',
    );

    const response = await request.get(directPath);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('image/jpeg');
  });

  test('rejects a dangerous double extension before storing anything', async ({ page }) => {
    const account = buildAccount('portrait-double-extension');

    await signUp(page, account);
    await createPortfolio(page, 'Portrait Guard');
    await openEditorDisclosure(page, 'Photos and downloads');

    await page.getByLabel('Portrait image').setInputFiles({
      name: 'portrait.exe.png',
      mimeType: 'image/png',
      buffer: await readFile(PORTRAIT_FIXTURE),
    });
    await page.getByRole('button', { name: 'Use this framing' }).click();
    await page.getByRole('button', { name: 'Upload portrait' }).click();

    await expect(page.getByText('That filename contains a forbidden file type.')).toBeVisible();
  });
});
