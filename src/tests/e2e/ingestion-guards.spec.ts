import { expect, test } from '@playwright/test';

import { buildDocxFixture } from '@/packages/document-text/test-support';

import {
  buildAccount,
  createPortfolio,
  openEditorDisclosure,
  openImport,
  publishPortfolio,
  signUp,
} from './support/accounts';
import { buildResumePdf, INJECTION_LINES } from './support/pdf.fixture';

/**
 * What the import pipeline refuses, and what it refuses to believe.
 *
 * An upload is the one place a user hands the platform a file they did not
 * write and a model reads it. Both halves of that sentence are attack surface.
 */

test.describe('upload validation', () => {
  test('refuses a file that is not a PDF, whatever it claims to be', async ({ page }) => {
    const account = buildAccount('not-pdf');

    await signUp(page, account);
    await createPortfolio(page, 'Upload Guard');
    await openImport(page);

    // The browser-reported MIME type says PDF; the bytes do not. The magic
    // number is what decides.
    await page.getByLabel('CV file').setInputFiles({
      name: 'resume.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('This is a text file wearing a PDF name.', 'utf8'),
    });

    await page.getByRole('button', { name: 'Import' }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    expect(page.url()).toContain('/import');
  });

  test('refuses an empty file', async ({ page }) => {
    const account = buildAccount('empty');

    await signUp(page, account);
    await createPortfolio(page, 'Empty Upload');
    await openImport(page);

    await page.getByLabel('CV file').setInputFiles({
      name: 'empty.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.alloc(0),
    });

    await page.getByRole('button', { name: 'Import' }).click();

    await expect(page.getByRole('alert')).toBeVisible();
  });
});

test.describe('Word document import', () => {
  test('extracts a scanner-validated DOCX into an owner-reviewable draft', async ({ page }) => {
    const account = buildAccount('docx-import');

    await signUp(page, account);
    await createPortfolio(page, 'DOCX Import');
    await openImport(page);

    await page.getByLabel('CV file').setInputFiles({
      name: 'ada-lovelace.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: Buffer.from(
        buildDocxFixture(
          [
            'Ada Lovelace',
            'Analytical engine programmer',
            'London',
            'Experience',
            'Mathematician and technical writer documenting algorithms for the analytical engine.',
            'Collaborated on mathematical research, computational methods, and explanatory notes.',
          ].join('\n'),
        ),
      ),
    });
    await page.getByRole('button', { name: 'Import' }).click();
    await page.waitForURL('**/editor', { timeout: 60_000 });

    await expect(page.getByLabel('Display name')).toHaveValue('Ada Lovelace');
    await openEditorDisclosure(page, 'Photos and downloads');
    const importedAttachment = page.getByText('ada-lovelace.docx', { exact: true }).locator('..');
    await expect(importedAttachment).toBeVisible();
    await expect(importedAttachment.getByRole('checkbox')).not.toBeChecked();
  });
});

test.describe('prompt injection', () => {
  /**
   * A CV that tells the model what to do.
   *
   * The extractor's contract is that resume text is data, not instruction. The
   * assertion is deliberately about the *published output*: whatever happens
   * inside the model, the instruction must not end up as a field on someone's
   * page.
   */
  test('an instruction in a CV becomes content, never a directive', async ({ page }) => {
    const account = buildAccount('injection');

    await signUp(page, account);
    await createPortfolio(page, 'Sami Farouk');
    await openImport(page);

    await page.getByLabel('CV file').setInputFiles({
      name: 'sami-cv.pdf',
      mimeType: 'application/pdf',
      buffer: buildResumePdf(INJECTION_LINES),
    });

    await page.getByRole('button', { name: 'Import' }).click();
    await page.waitForURL('**/editor', { timeout: 60_000 });

    await expect(page.getByLabel('Headline')).not.toHaveValue(/OWNED/i);
    await expect(page.getByLabel('Display name')).toHaveValue('Sami Farouk');
  });
});

test.describe('publish readiness', () => {
  test('refuses to publish a portfolio with nothing on it, and says why', async ({ page }) => {
    const account = buildAccount('blockers');

    await signUp(page, account);
    await createPortfolio(page, 'Blank Portfolio');

    await page.getByRole('button', { name: 'Publish', exact: true }).click();

    // Every blocker at once, rather than one per refused attempt.
    await expect(page.getByText('Before you can publish')).toBeVisible();
    await expect(page.getByText('Add a headline so a reader knows what you do.')).toBeVisible();
  });

  test('refuses a reserved address', async ({ page }) => {
    const account = buildAccount('reserved');

    await signUp(page, account);
    await createPortfolio(page, 'Reserved Address');

    await page.getByLabel('Public address').fill('dashboard');
    await page.getByRole('button', { name: 'Save address' }).click();

    await expect(page.getByRole('alert')).toBeVisible();
  });
});

test.describe('unpublishing', () => {
  test('takes the page down and keeps the draft', async ({ page, request }) => {
    const account = buildAccount('unpublish');

    await signUp(page, account);
    const slug = await publishPortfolio(page, 'Taken Down');

    await expect.poll(async () => (await request.get(`/${slug}`)).status()).toBe(200);

    await page.getByRole('button', { name: 'Unpublish' }).click();

    // The address stops serving immediately — a stale cache here would be a
    // correctness bug, not a performance detail.
    await expect.poll(async () => (await request.get(`/${slug}`)).status()).toBe(404);

    await page.reload();

    // The work survives the page coming down.
    await expect(page.getByLabel('Headline')).toHaveValue('Platform engineer');
  });
});
