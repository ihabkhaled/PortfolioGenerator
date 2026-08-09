import { expect, test } from '@playwright/test';

import {
  ADSENSE_CLIENT_ID,
  ADSENSE_SCRIPT_URL,
  ADS_TXT_RECORD,
} from '@/shared/constants/advertising.constants';

test.describe('public discovery endpoints', () => {
  test('serves the authorized advertising record exactly', async ({ request }) => {
    const response = await request.get('/ads.txt');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/plain');
    expect((await response.text()).trim()).toBe(ADS_TXT_RECORD);
  });

  test('serves bounded public RSS without protected route references', async ({ request }) => {
    const response = await request.get('/feed.xml');
    const body = await response.text();

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/rss+xml');
    expect(response.headers()['cache-control']).toContain('s-maxage=300');
    expect(body).toContain('<rss version="2.0">');
    expect(body).not.toContain('/dashboard');
    expect(body).not.toContain('/api/');
  });
});

test.describe('AdSense discovery metadata', () => {
  test('loads the official script once under the response CSP nonce', async ({ page }) => {
    const response = await page.goto('/');
    const contentSecurityPolicy = response?.headers()['content-security-policy'] ?? '';
    const scripts = page.locator(`script[src="${ADSENSE_SCRIPT_URL}"]`);

    await expect(page.locator(`meta[name="google-adsense-account"]`)).toHaveAttribute(
      'content',
      ADSENSE_CLIENT_ID,
    );
    await expect(scripts).toHaveCount(1);
    await expect(scripts).toHaveAttribute('async', '');
    await expect(scripts).toHaveAttribute('crossorigin', 'anonymous');

    const nonce = await scripts.evaluate((element) => (element as HTMLScriptElement).nonce);

    expect(nonce).not.toBe('');
    expect(contentSecurityPolicy).toContain(`'nonce-${nonce}'`);
  });
});
