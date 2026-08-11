import { expect, test } from '@playwright/test';

import {
  buildAccount,
  createPortfolio,
  openEditorDisclosure,
  publishPortfolio,
  signUp,
  uniqueSlug,
} from '../e2e/support/accounts';

/**
 * The parts axe cannot check.
 *
 * Automated rules verify that a control has a name and a role; they cannot
 * verify that a keyboard user can actually get to it and operate it. Section
 * reordering is the clearest case in this product: it is how someone decides
 * what a reader sees first, and it exists as buttons rather than as a drag
 * gesture precisely so this test can be written.
 */

test.describe('keyboard operation', () => {
  test('the skip link is the first stop and jumps to the content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const focused = page.locator(':focus');

    await expect(focused).toHaveAttribute('href', '#main-content');

    await page.keyboard.press('Enter');

    expect(page.url()).toContain('#main-content');
  });

  test('a portfolio can be created without a pointer', async ({ page }) => {
    await signUp(page, buildAccount('kbd-create'));
    await page.goto('/dashboard');

    await page.getByLabel('Display name').focus();
    await page.keyboard.type('Keyboard Only');
    await page.keyboard.press('Tab');
    await page.keyboard.type(uniqueSlug('keyboard-only'));
    await page.keyboard.press('Enter');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Keyboard Only' }).first(),
    ).toBeVisible();
  });

  test('sections reorder from the keyboard', async ({ page }) => {
    await signUp(page, buildAccount('kbd-reorder'));
    await createPortfolio(page, 'Reorder Me');
    await openEditorDisclosure(page, 'Page sections');

    const moveDown = page.getByRole('button', { name: /down/i }).first();

    await moveDown.focus();
    await expect(moveDown).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(page.getByText('Unsaved changes').first()).toBeVisible();
  });

  // A control that cannot be reached is a control that does not exist for the
  // people who most need the confirmation step.
  test('the account deletion confirmation is reachable and operable by keyboard', async ({
    page,
  }) => {
    await signUp(page, buildAccount('kbd-delete'));
    await page.goto('/dashboard/settings');

    const accountDeletionSummary = page
      .locator('summary')
      .filter({ has: page.getByText('Delete your account', { exact: true }) });
    await accountDeletionSummary.focus();
    await expect(accountDeletionSummary).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(accountDeletionSummary.locator('..')).toHaveAttribute('open', '');

    const field = page.getByLabel(/type/i);

    await field.focus();
    await page.keyboard.type('DELETE');

    await page.keyboard.press('Tab');

    await expect(page.getByRole('button', { name: 'Delete my account' })).toBeFocused();
  });

  test('a link on the published page has a visible focus ring', async ({ page }) => {
    await signUp(page, buildAccount('kbd-focus'));
    const slug = await publishPortfolio(page, 'Focus Ring');
    await page.goto(`/${slug}`);

    const first = page.getByRole('link').first();

    await first.focus();

    const outline = await first.evaluate((element) => {
      const style = globalThis.getComputedStyle(element);

      return `${style.outlineStyle} ${style.outlineWidth}`;
    });

    expect(outline).not.toContain('none');
  });
});
