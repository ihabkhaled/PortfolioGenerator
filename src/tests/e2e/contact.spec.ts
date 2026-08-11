import { expect, test } from '@playwright/test';

const validMessage = {
  name: 'Mina Hassan',
  email: 'mina@example.com',
  subject: 'A product question',
  message: 'Could you explain how private portfolio pages work?',
  website: '',
};

test.describe('contact delivery boundary', () => {
  test('rejects malformed input without allowing it to be cached', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: { ...validMessage, email: 'not-an-email' },
    });

    expect(response.status()).toBe(400);
    expect(response.headers()['cache-control']).toContain('no-store');
    await expect(response.json()).resolves.toEqual({ status: 'invalid' });
  });

  test('silently accepts the honeypot without attempting public delivery', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: { ...validMessage, website: 'https://spam.example' },
    });

    expect(response.status()).toBe(202);
    await expect(response.json()).resolves.toEqual({ status: 'accepted' });
  });

  test('submits a valid message through the public form and clears it', async ({ page }) => {
    await page.goto('/guides/contact');
    await page.getByLabel('Name').fill(validMessage.name);
    await page.getByLabel('Email').fill(validMessage.email);
    await page.getByLabel('Subject').fill(validMessage.subject);
    await page.getByLabel('Message').fill(validMessage.message);
    await page.getByRole('button', { name: 'Send message' }).click();

    await expect(
      page.getByText('Your message was accepted. We will reply by email.'),
    ).toBeVisible();
    await expect(page.getByLabel('Message')).toHaveValue('');
  });
});
