import { expect, test } from '@playwright/test';

import { buildAccount, createPortfolio, signUp } from './support/accounts';

test.describe('password-protected portfolio pages', () => {
  test('stays out of navigation and requires its share password', async ({ page, browser }) => {
    const account = buildAccount('private-page');
    const password = 'private field notes';

    await signUp(page, account);
    const slug = await createPortfolio(page, 'Private Page Owner');
    await page.getByLabel('Headline').fill('Systems engineer');
    await page.getByLabel('Summary').fill('Public profile with owner-controlled field notes.');
    await page.locator('#new-page-title').fill('Field notes');
    await page.locator('#new-page-nav').fill('Notes');
    await page.locator('#new-page-slug').fill('notes');
    await page.getByRole('button', { name: 'Add page' }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Saved').first()).toBeVisible();

    await page.getByLabel('Page access').last().selectOption('private');
    await page.getByLabel('Share password').last().fill(password);
    await page.getByRole('button', { name: 'Update page access' }).last().click();
    await expect(page.getByText('Page access updated.')).toBeVisible();
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    await page.getByRole('button', { name: 'Unpublish' }).waitFor();

    const visitor = await browser.newContext();
    const publicPage = await visitor.newPage();
    await publicPage.goto(`/${slug}`);
    await expect(publicPage.getByRole('link', { name: 'Notes' })).toHaveCount(0);

    await publicPage.goto(`/${slug}/notes`);
    await expect(publicPage.getByRole('heading', { name: /private page/i })).toBeVisible();
    await publicPage.getByLabel('Password').fill('incorrect password');
    await publicPage.getByRole('button', { name: /unlock/i }).click();
    await expect(publicPage.getByRole('alert')).toBeVisible();

    await publicPage.getByLabel('Password').fill(password);
    await publicPage.getByRole('button', { name: /unlock/i }).click();
    await publicPage.waitForURL(`**/${slug}/notes`);
    await expect(publicPage.getByRole('heading', { name: 'Field notes' })).toBeVisible();
    await visitor.close();
  });

  test('does not reveal a private page in the sitemap', async ({ page, request }) => {
    const account = buildAccount('private-sitemap');

    await signUp(page, account);
    const slug = await createPortfolio(page, 'Private Sitemap Owner');
    await page.locator('#new-page-title').fill('Confidential');
    await page.locator('#new-page-nav').fill('Confidential');
    await page.locator('#new-page-slug').fill('confidential');
    await page.getByRole('button', { name: 'Add page' }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Saved').first()).toBeVisible();
    await page.getByLabel('Page access').last().selectOption('private');
    await page.getByLabel('Share password').last().fill('a private sitemap password');
    await page.getByRole('button', { name: 'Update page access' }).last().click();

    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).not.toContain(`/${slug}/confidential`);
  });
});
