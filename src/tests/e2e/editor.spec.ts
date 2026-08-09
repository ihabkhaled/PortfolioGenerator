import { expect, test } from '@playwright/test';

import { buildAccount, createPortfolio, signUp } from './support/accounts';

test.describe('collection and page authoring', () => {
  test('persists a project and its page through save and reload', async ({ page }) => {
    const account = buildAccount('editor-content');

    await signUp(page, account);
    await createPortfolio(page, 'Editor Owner');

    const projects = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Projects', exact: true }),
    });
    await projects.getByRole('button', { name: 'Add entry' }).click();
    await projects.getByLabel('Name').fill('Fault-tolerant scheduler');
    await projects.getByLabel('Project address').fill('scheduler');
    await projects.getByLabel('Summary').fill('A scheduler designed around predictable recovery.');

    await page.locator('#new-page-title').fill('Field notes');
    await page.locator('#new-page-nav').fill('Notes');
    await page.locator('#new-page-slug').fill('notes');
    await page.getByRole('button', { name: 'Add page' }).click();

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Saved').first()).toBeVisible();
    await page.reload();

    await expect(projects.getByLabel('Name')).toHaveValue('Fault-tolerant scheduler');
    await expect(page.getByLabel('Page title').last()).toHaveValue('Field notes');
    await expect(page.getByLabel('Address').last()).toHaveValue('notes');
  });

  test('reorders collection entries without losing their values', async ({ page }) => {
    const account = buildAccount('editor-order');

    await signUp(page, account);
    await createPortfolio(page, 'Ordering Owner');

    const awards = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Awards', exact: true }),
    });
    await awards.getByRole('button', { name: 'Add entry' }).click();
    await awards.getByRole('button', { name: 'Add entry' }).click();
    await awards.getByLabel('Name').nth(0).fill('First award');
    await awards.getByLabel('Name').nth(1).fill('Second award');
    await awards.getByRole('button', { name: 'Move entry up' }).nth(1).click();

    await expect(awards.getByLabel('Name').nth(0)).toHaveValue('Second award');
    await expect(awards.getByLabel('Name').nth(1)).toHaveValue('First award');
  });
});
