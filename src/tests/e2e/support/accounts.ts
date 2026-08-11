import { randomUUID } from 'node:crypto';

import { expect } from '@playwright/test';
import type { Browser, BrowserContext, Locator, Page } from '@playwright/test';

/**
 * Every spec creates its own account.
 *
 * A shared fixture user would make the suite order-dependent the first time a
 * spec published a portfolio, and the failure would look like flakiness rather
 * than like the coupling it is. Registration is one form post, so the cost is
 * a second per spec and the isolation is total.
 */

export interface TestAccount {
  readonly email: string;
  readonly password: string;
  readonly name: string;
}

export function buildAccount(label: string): TestAccount {
  return {
    // Unique per run and per spec. The label makes a leftover row in a local
    // database say which spec left it; the random suffix keeps two runs of the
    // same spec from colliding on the unique email constraint.
    email: `e2e-${label}-${randomUUID().slice(0, 8)}@example.com`,
    password: 'correct horse battery staple',
    name: `E2E ${label}`,
  };
}

export async function signUp(page: Page, account: TestAccount): Promise<void> {
  await page.goto('/sign-up');
  await page.getByLabel('Name', { exact: true }).fill(account.name);
  await page.getByLabel('Email').fill(account.email);
  await page.getByLabel('Password', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: /create account/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/u);
}

export async function signIn(page: Page, account: TestAccount): Promise<void> {
  await page.goto('/sign-in');
  await page.getByLabel('Email').fill(account.email);
  await page.getByLabel('Password', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/u);
}

/**
 * A slug nothing else in this database has taken.
 *
 * Slugs are globally unique, so leaving the field empty and letting the product
 * suggest one from the display name collides the second time any spec uses the
 * same name — including across runs, because the rows persist.
 */
export function uniqueSlug(label: string): string {
  return `${label.toLowerCase().replaceAll(/[^a-z0-9]+/gu, '-')}-${randomUUID().slice(0, 8)}`;
}

/**
 * Create a portfolio and land where the product puts you: its editor.
 *
 * The redirect is the product's choice — a new portfolio is empty, and the
 * dashboard would show a row with nothing to look at — so the helper waits for
 * it rather than assuming the caller goes back to the list.
 */
export async function createPortfolio(page: Page, displayName: string): Promise<string> {
  const slug = uniqueSlug(displayName);

  await page.goto('/dashboard');
  await page.getByLabel('Display name').fill(displayName);
  await page.getByLabel('Public address').fill(slug);
  await page.getByRole('button', { name: 'Create' }).click();
  await page.waitForURL('**/editor');

  return slug;
}

/** The import screen for the portfolio whose editor is open. */
export async function openImport(page: Page): Promise<void> {
  await page.goto(page.url().replace('/editor', '/import'));
}

/**
 * The browser behind a context, without an optional-chain in a test.
 *
 * `context.browser()` is nullable because a context can outlive its browser.
 * That cannot happen inside a running test, and a conditional in a spec reads
 * as a branch the test is exercising rather than as a type narrowing.
 */
export function requireBrowser(context: BrowserContext): Browser {
  const browser = context.browser();

  if (browser === null) {
    throw new Error('Expected the test context to have a browser');
  }

  return browser;
}

/**
 * The editor's one authoritative Save action.
 *
 * A second, contextual "Save" button lives inside the Publish panel's own
 * unsaved-changes banner and does the same thing — it only renders while the
 * draft is dirty, which is exactly when a test is about to click Save, so an
 * unscoped `getByRole('button', { name: 'Save' })` resolves to two elements.
 * Scoping to the header picks the editor's persistent Save action rather than
 * relying on which one happens to come first in the DOM.
 */
export async function saveEditor(page: Page): Promise<void> {
  const actionDock = page.locator('[data-fixed-surface="editor-actions"]');
  const saveButton = actionDock.getByRole('button', { name: 'Save', exact: true });

  await expect(saveButton).toBeEnabled();
  await saveButton.click();
  await expect(actionDock.getByText('Saved', { exact: true })).toBeVisible();
}

/** Submit one editor server action and wait for its exact route response. */
export async function submitEditorServerAction(page: Page, button: Locator): Promise<void> {
  const editorPath = new URL(page.url()).pathname;
  const completed = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && new URL(response.url()).pathname === editorPath,
  );

  await button.click();
  await completed;
}

/** Open one editor disclosure through the same summary control a user operates. */
export async function openEditorDisclosure(page: Page, label: string): Promise<Locator> {
  const summary = page
    .locator('summary')
    .filter({ has: page.getByText(label, { exact: true }) })
    .first();
  const disclosure = summary.locator('..');

  await expect(summary).toBeVisible();
  if ((await disclosure.getAttribute('open')) === null) await summary.click();
  await expect(disclosure).toHaveAttribute('open', '');

  return disclosure;
}

/** Open every still-collapsed disclosure below an already-open editor region. */
export async function openNestedEditorDisclosures(region: Locator): Promise<void> {
  const summaries = region.locator('details > summary');
  const count = await summaries.count();

  for (let index = 0; index < count; index += 1) {
    const summary = summaries.nth(index);
    const disclosure = summary.locator('..');
    if ((await disclosure.getAttribute('open')) === null) await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
  }
}

/** Open every authored page card inside the editor's Pages disclosure. */
export async function openEditorPageEntries(page: Page): Promise<Locator> {
  const pages = await openEditorDisclosure(page, 'Pages');
  await openNestedEditorDisclosures(pages);
  return pages.getByRole('list');
}

/**
 * Create, fill and publish a portfolio in one call.
 *
 * Several specs need a live public page to assert against. Building one is
 * cheaper and far more honest than depending on the development seed: a suite
 * that skips when a seed is missing is a suite that reports green on an empty
 * database.
 */
export async function publishPortfolio(page: Page, displayName: string): Promise<string> {
  const slug = await createPortfolio(page, displayName);

  await page.getByLabel('Headline').fill('Platform engineer');
  await page.getByLabel('Summary').fill('A short summary so the portfolio is publishable.');
  await saveEditor(page);
  await page.getByText('Saved').first().waitFor();

  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  await page.getByRole('button', { name: 'Unpublish' }).waitFor();

  return slug;
}

/**
 * Claim a new address and wait until the server actually holds it.
 *
 * The claim is its own server action, and the publish button next to it is
 * another. Reloading is the honest way to know the first one landed: the field
 * is server-rendered, so it shows the new value only once the row has it.
 */
export async function claimAddress(page: Page, slug: string): Promise<void> {
  await page.getByLabel('Public address').fill(slug);
  await page.getByRole('button', { name: 'Save address' }).click();
  await page.reload();
  await page.getByLabel('Public address').waitFor();
}
