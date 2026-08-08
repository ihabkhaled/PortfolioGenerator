import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { Result } from 'axe-core';

import {
  buildAccount,
  createPortfolio,
  openImport,
  publishPortfolio,
  signUp,
} from '../e2e/support/accounts';

/**
 * Automated accessibility checks on every page a user can reach.
 *
 * axe catches a real but bounded set of problems — contrast, names, roles,
 * landmarks — and catches them on every commit, which is what makes it worth
 * having. It is not a substitute for the keyboard walkthrough in the sibling
 * spec, and the launch checklist says so.
 *
 * WCAG 2.2 AA is the bar. The tags are named rather than left to axe's defaults
 * so that raising the bar is a visible change to this line.
 */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function findViolations(page: Page): Promise<readonly Result[]> {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

  return results.violations;
}

test.describe('public pages', () => {
  for (const path of ['/', '/sign-in', '/sign-up']) {
    test(`${path} has no automatically detectable violations`, async ({ page }) => {
      await page.goto(path);

      expect(await findViolations(page)).toEqual([]);
    });
  }

  test('a not-found page is still navigable', async ({ page }) => {
    await page.goto('/no-such-portfolio-at-all');

    expect(await findViolations(page)).toEqual([]);
  });
});

test.describe('signed-in pages', () => {
  test('the dashboard', async ({ page }) => {
    await signUp(page, buildAccount('a11y-dashboard'));

    expect(await findViolations(page)).toEqual([]);
  });

  test('the account settings page', async ({ page }) => {
    await signUp(page, buildAccount('a11y-settings'));
    await page.goto('/dashboard/settings');

    expect(await findViolations(page)).toEqual([]);
  });

  test('the import screen', async ({ page }) => {
    await signUp(page, buildAccount('a11y-import'));
    await createPortfolio(page, 'Accessible Import');
    await openImport(page);

    expect(await findViolations(page)).toEqual([]);
  });

  test('the editor, including its live preview', async ({ page }) => {
    await signUp(page, buildAccount('a11y-editor'));
    await createPortfolio(page, 'Accessible Editor');

    expect(await findViolations(page)).toEqual([]);
  });
});

test.describe('the published portfolio', () => {
  /**
   * Built by the test rather than read from the development seed.
   *
   * A suite that skips when the seed is absent reports green on an empty
   * database, which is the one condition under which it should be loudest.
   */
  test('has no violations in either theme', async ({ page }) => {
    await signUp(page, buildAccount('a11y-public'));
    const slug = await publishPortfolio(page, 'Accessible Portfolio');

    await page.goto(`/${slug}`);
    expect(await findViolations(page)).toEqual([]);

    // The palette flips entirely in dark mode; contrast has to hold in both.
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.reload();
    expect(await findViolations(page)).toEqual([]);
  });

  test('holds up at a 320px viewport', async ({ page }) => {
    await signUp(page, buildAccount('a11y-narrow'));
    const slug = await publishPortfolio(page, 'Narrow Portfolio');

    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto(`/${slug}`);

    expect(await findViolations(page)).toEqual([]);

    // Reflow: no horizontal scrolling at the narrowest supported width.
    const overflows = await page.evaluate(
      () => globalThis.document.documentElement.scrollWidth > globalThis.innerWidth + 1,
    );

    expect(overflows).toBe(false);
  });
});
