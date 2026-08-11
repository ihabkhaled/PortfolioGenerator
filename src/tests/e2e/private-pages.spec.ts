import { expect, test } from '@playwright/test';

import {
  buildAccount,
  createPortfolio,
  openEditorDisclosure,
  openEditorPageEntries,
  saveEditor,
  signUp,
  submitEditorServerAction,
} from './support/accounts';
import { readOwnedAssetStorageKey } from './support/database';
import { buildResumePdf } from './support/pdf.fixture';

function requireAttribute(value: string | null): string {
  if (value === null) throw new Error('Expected the attachment draft control');
  return value;
}

test.describe('password-protected portfolio pages', () => {
  test('serves private media only with the exact page grant', async ({ page, browser }) => {
    const account = buildAccount('private-media');
    const notesPassword = 'localized private media';
    const otherPassword = 'wrong private page grant';
    const expectedBytes = buildResumePdf([`Private owner-approved brief for ${account.email}`]);
    await signUp(page, account);
    const slug = await createPortfolio(page, 'Private Media Owner');
    await openEditorDisclosure(page, 'Pages');

    for (const [title, nav, pageSlug] of [
      ['Private notes', 'Notes', 'notes'],
      ['Other private page', 'Other', 'other'],
    ] as const) {
      await page.locator('#new-page-title').fill(title);
      await page.locator('#new-page-nav').fill(nav);
      await page.locator('#new-page-slug').fill(pageSlug);
      await page.getByRole('button', { name: 'Add page' }).click();
    }
    await openEditorDisclosure(page, 'Photos and downloads');
    await page.getByLabel('Downloadable file').setInputFiles({
      name: 'private-brief.pdf',
      mimeType: 'application/pdf',
      buffer: expectedBytes,
    });
    await page.getByLabel('Public download label').fill('Private brief');
    await page.getByRole('button', { name: 'Upload attachment' }).click();
    const notesPlacement = page.getByLabel('Downloadable file: Notes');
    await expect(notesPlacement).toBeVisible();
    await notesPlacement.check();
    const attachmentControlId = requireAttribute(
      await page.getByLabel('Show publicly').last().getAttribute('id'),
    );
    const assetId = attachmentControlId.replace('attachment-visible-attachment-', '');
    const storageKey = await readOwnedAssetStorageKey({
      ownerEmail: account.email,
      assetId,
    });

    await saveEditor(page);
    await expect(page.getByText('Saved').first()).toBeVisible();
    await openEditorPageEntries(page);
    for (const [index, password] of [notesPassword, otherPassword].entries()) {
      await page.getByLabel('Page access').nth(index).selectOption('private');
      await page.getByLabel('Share password').nth(index).fill(password);
      await submitEditorServerAction(
        page,
        page.getByRole('button', { name: 'Update page access' }).nth(index),
      );
      await expect(page.getByText('Page access updated.').nth(index)).toBeVisible();
    }
    await page.getByLabel('Headline').fill('Security engineer');
    await page.getByLabel('Summary').fill('A reviewed private-media portfolio.');
    await saveEditor(page);
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    await page.getByRole('button', { name: 'Unpublish' }).waitFor();

    const mediaPath = `/portfolios/${slug}/notes/media/${assetId}`;
    const anonymous = await browser.newContext();
    const anonymousResponse = await anonymous.request.get(mediaPath);
    expect(anonymousResponse.status()).toBe(404);
    expect(anonymousResponse.headers()['cache-control']).toContain('private, no-store');
    expect(anonymousResponse.headers()['x-robots-tag']).toContain('noindex, nofollow');
    expect(await anonymousResponse.text()).not.toContain('.storage');

    const wrongGrant = await browser.newContext();
    await wrongGrant.request.post('/api/private-page-access', {
      form: { portfolioSlug: slug, pageSlug: 'other', password: otherPassword, locale: 'en' },
      maxRedirects: 0,
    });
    expect((await wrongGrant.request.get(mediaPath)).status()).toBe(404);

    const granted = await browser.newContext();
    const exactGrant = await granted.request.post('/api/private-page-access', {
      form: { portfolioSlug: slug, pageSlug: 'notes', password: notesPassword, locale: 'en' },
      maxRedirects: 0,
    });
    expect(exactGrant.status()).toBe(303);
    expect(
      (await granted.cookies()).some(
        (cookie) =>
          cookie.path === `/portfolios/${slug}/notes` && cookie.name.startsWith('pg_private_'),
      ),
    ).toBe(true);
    const grantedResponse = await granted.request.get(mediaPath);
    expect(grantedResponse.status()).toBe(200);
    expect(grantedResponse.headers()['content-type']).toBe('application/pdf');
    expect(grantedResponse.headers()['cache-control']).toContain('private, no-store');
    expect(grantedResponse.headers()['x-robots-tag']).toContain('noindex, nofollow');
    const grantedBody = await grantedResponse.body();
    expect(grantedBody).toEqual(expectedBytes);
    expect(JSON.stringify(grantedResponse.headers())).not.toContain(storageKey);
    expect(grantedResponse.url()).not.toContain(storageKey);
    expect(grantedBody.toString('latin1')).not.toContain(storageKey);
    await Promise.all([anonymous.close(), wrongGrant.close(), granted.close()]);
  });

  test('stays out of navigation and requires its share password', async ({ page, browser }) => {
    const account = buildAccount('private-page');
    const password = 'private field notes';

    await signUp(page, account);
    const slug = await createPortfolio(page, 'Private Page Owner');
    await page.getByLabel('Headline').fill('Systems engineer');
    await page.getByLabel('Summary').fill('Public profile with owner-controlled field notes.');
    await openEditorDisclosure(page, 'Pages');
    await page.locator('#new-page-title').fill('Field notes');
    await page.locator('#new-page-nav').fill('Notes');
    await page.locator('#new-page-slug').fill('notes');
    await page.getByRole('button', { name: 'Add page' }).click();
    await saveEditor(page);
    await expect(page.getByText('Saved').first()).toBeVisible();
    await openEditorPageEntries(page);

    await page.getByLabel('Page access').last().selectOption('private');
    await page.getByLabel('Share password').last().fill(password);
    await submitEditorServerAction(
      page,
      page.getByRole('button', { name: 'Update page access' }).last(),
    );
    await expect(page.getByText('Page access updated.')).toBeVisible();
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    await page.getByRole('button', { name: 'Unpublish' }).waitFor();

    const visitor = await browser.newContext();
    const publicPage = await visitor.newPage();
    await publicPage.goto(`/portfolios/${slug}`);
    await expect(publicPage.getByRole('link', { name: 'Notes' })).toHaveCount(0);

    const challengeResponse = await publicPage.goto(`/portfolios/${slug}/notes`);
    expect(challengeResponse?.headers()['cache-control']).toContain('private, no-store');
    expect(challengeResponse?.headers()['x-robots-tag']).toContain('noindex, nofollow');
    await expect(publicPage.getByRole('heading', { name: /this page is private/i })).toBeVisible();
    await publicPage.getByLabel('Password').fill('incorrect password');
    await publicPage.getByRole('button', { name: /open private page/i }).click();
    await expect(publicPage.getByRole('alert')).toBeVisible();

    await publicPage.getByLabel('Password').fill(password);
    await publicPage.getByRole('button', { name: /open private page/i }).click();
    await expect(publicPage.getByRole('heading', { name: /this page is private/i })).toHaveCount(0);
    await expect(publicPage.getByRole('link', { name: /profolio home/i })).toBeVisible();
    const contentResponse = await publicPage.reload();
    expect(contentResponse?.headers()['cache-control']).toContain('private, no-store');
    expect(contentResponse?.headers()['x-robots-tag']).toContain('noindex, nofollow');
    await expect(publicPage.getByRole('heading', { name: /this page is private/i })).toHaveCount(0);
    await visitor.close();
  });

  test('returns a locale-scoped redirect and cookie after a localized unlock', async ({ page }) => {
    const account = buildAccount('private-localized');
    const password = 'localized private notes';
    await signUp(page, account);
    const slug = await createPortfolio(page, 'Localized Private Owner');
    await page.getByLabel('Headline').fill('Localization engineer');
    await page.getByLabel('Summary').fill('A reviewed portfolio with localized private notes.');
    await openEditorDisclosure(page, 'Pages');
    await page.locator('#new-page-title').fill('Notes');
    await page.locator('#new-page-nav').fill('Notes');
    await page.locator('#new-page-slug').fill('notes');
    await page.getByRole('button', { name: 'Add page' }).click();
    await saveEditor(page);
    await openEditorPageEntries(page);
    await page.getByLabel('Page access').last().selectOption('private');
    await page.getByLabel('Share password').last().fill(password);
    await submitEditorServerAction(
      page,
      page.getByRole('button', { name: 'Update page access' }).last(),
    );
    await submitEditorServerAction(
      page,
      page.getByRole('button', { name: 'Publish', exact: true }),
    );
    await page.getByRole('button', { name: 'Unpublish' }).waitFor();

    const response = await page.request.post('/api/private-page-access', {
      form: { portfolioSlug: slug, pageSlug: 'notes', password, locale: 'fr' },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(303);
    expect(response.headers()['location']).toContain(`/fr/portfolios/${slug}/notes`);
    expect(response.headers()['set-cookie']).toContain(`Path=/fr/portfolios/${slug}/notes`);
  });

  test('rate-limits repeated password guesses before issuing a grant', async ({ page }) => {
    const account = buildAccount('private-rate-limit');
    const password = 'bounded private password';
    await signUp(page, account);
    const slug = await createPortfolio(page, 'Rate Limited Private Owner');
    await page.getByLabel('Headline').fill('Security engineer');
    await page.getByLabel('Summary').fill('A reviewed portfolio with a protected private page.');
    await openEditorDisclosure(page, 'Pages');
    await page.locator('#new-page-title').fill('Notes');
    await page.locator('#new-page-nav').fill('Notes');
    await page.locator('#new-page-slug').fill('notes');
    await page.getByRole('button', { name: 'Add page' }).click();
    await saveEditor(page);
    await openEditorPageEntries(page);
    await page.getByLabel('Page access').last().selectOption('private');
    await page.getByLabel('Share password').last().fill(password);
    await submitEditorServerAction(
      page,
      page.getByRole('button', { name: 'Update page access' }).last(),
    );
    await submitEditorServerAction(
      page,
      page.getByRole('button', { name: 'Publish', exact: true }),
    );
    await page.getByRole('button', { name: 'Unpublish' }).waitFor();

    for (let attempt = 0; attempt < 10; attempt += 1) {
      await page.request.post('/api/private-page-access', {
        form: { portfolioSlug: slug, pageSlug: 'notes', password: 'wrong', locale: 'en' },
        maxRedirects: 0,
      });
    }
    const blocked = await page.request.post('/api/private-page-access', {
      form: { portfolioSlug: slug, pageSlug: 'notes', password, locale: 'en' },
      maxRedirects: 0,
    });
    expect(blocked.status()).toBe(303);
    expect(blocked.headers()['location']).toContain('access=denied');
    expect(blocked.headers()['set-cookie']).toBeUndefined();
  });

  test('does not reveal a private page in the sitemap', async ({ page, request }) => {
    const account = buildAccount('private-sitemap');

    await signUp(page, account);
    const slug = await createPortfolio(page, 'Private Sitemap Owner');
    await openEditorDisclosure(page, 'Pages');
    await page.locator('#new-page-title').fill('Confidential');
    await page.locator('#new-page-nav').fill('Confidential');
    await page.locator('#new-page-slug').fill('confidential');
    await page.getByRole('button', { name: 'Add page' }).click();
    await saveEditor(page);
    await expect(page.getByText('Saved').first()).toBeVisible();
    await openEditorPageEntries(page);
    await page.getByLabel('Page access').last().selectOption('private');
    await page.getByLabel('Share password').last().fill('a private sitemap password');
    await page.getByRole('button', { name: 'Update page access' }).last().click();

    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).not.toContain(`/${slug}/confidential`);
  });
});
