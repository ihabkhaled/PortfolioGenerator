import { expect, test } from '@playwright/test';

test.describe('localized routes', () => {
  for (const [locale, direction] of [
    ['fr', 'ltr'],
    ['ar', 'rtl'],
    ['fa', 'rtl'],
  ] as const) {
    test(`serves /${locale} with locale metadata`, async ({ page }) => {
      const response = await page.goto(`/${locale}`);

      expect(response?.status()).toBe(200);
      expect(response?.headers()['content-language']).toBe(locale);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('html')).toHaveAttribute('dir', direction);
    });
  }

  test('language switching preserves the route, query and fragment', async ({ page }) => {
    await page.goto('/features?source=locale-test#details');
    await page.getByLabel('Language').selectOption('fr');

    await page.waitForURL('**/fr/features?source=locale-test#details');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });

  test('an unsupported locale remains an ordinary not-found route', async ({ page }) => {
    const response = await page.goto('/xx');

    expect(response?.status()).toBe(404);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});
