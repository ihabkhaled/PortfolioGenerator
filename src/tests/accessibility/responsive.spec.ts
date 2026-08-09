import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { portfolioDocumentSchema } from '@/modules/portfolio-document';
import { parseSchema } from '@/packages/zod';

import { buildAccount, createPortfolio, openImport, signUp } from '../e2e/support/accounts';
import {
  publishOwnedTranslationSnapshotForTest,
  readOwnedPublishedDocument,
} from '../e2e/support/database';

import { expectResponsivePage } from './support/responsive-proof';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function expectNoBlockingViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(results.violations).toEqual([]);
}

async function createPrivateChallenge(page: Page): Promise<string> {
  const slug = await createPortfolio(page, 'Responsive Private Portfolio');
  await page.getByLabel('Headline').fill('Systems engineer');
  await page.getByLabel('Summary').fill('A reviewed portfolio with owner-controlled notes.');
  await page.locator('#new-page-title').fill('Private field notes');
  await page.locator('#new-page-nav').fill('Notes');
  await page.locator('#new-page-slug').fill('notes');
  await page.getByRole('button', { name: 'Add page' }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Saved').first()).toBeVisible();
  await page.getByLabel('Page access').last().selectOption('private');
  await page.getByLabel('Share password').last().fill('responsive private notes');
  await page.getByRole('button', { name: 'Update page access' }).last().click();
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  await page.getByRole('button', { name: 'Unpublish' }).waitFor();
  return slug;
}

async function publishLongTranslatedPortfolio(
  page: Page,
  ownerEmail: string,
  locale: 'ar' | 'fa',
  displayName: string,
  headline: string,
  summary: string,
): Promise<string> {
  const slug = await createPortfolio(page, `RTL translation source ${locale}`);
  await page.getByLabel('Headline').fill('Platform engineer');
  await page
    .getByLabel('Summary')
    .fill('An English reviewed source snapshot for a separately published translation.');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Saved').first()).toBeVisible();
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  await page.getByRole('button', { name: 'Unpublish' }).waitFor();

  const storedDocument = await readOwnedPublishedDocument({ ownerEmail, portfolioSlug: slug });
  const parsedDocument = parseSchema(portfolioDocumentSchema, storedDocument);
  if (!parsedDocument.ok) throw new Error('Expected a valid owner-scoped published E2E document');
  const translatedDocument = {
    ...parsedDocument.value,
    identity: {
      ...parsedDocument.value.identity,
      displayName,
      headline,
      summary,
    },
  };
  const parsedTranslation = parseSchema(portfolioDocumentSchema, translatedDocument);
  if (!parsedTranslation.ok) throw new Error('Expected a valid translated E2E document');
  await publishOwnedTranslationSnapshotForTest({
    ownerEmail,
    portfolioSlug: slug,
    locale,
    document: parsedTranslation.value,
  });
  return slug;
}

test('critical surfaces reflow, remain operable, and preserve accessibility behavior', async ({
  page,
  browser,
}) => {
  test.setTimeout(240_000);

  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');
  await expectResponsivePage(page);

  const darkTheme = page.getByRole('radio', { name: 'Dark' });
  await darkTheme.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  const language = page.getByLabel('Language');
  await language.focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForURL('**/ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/ar/guides/accessibility');
  await expectResponsivePage(page);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.getByRole('radio').first().focus();
  await page.keyboard.press('Space');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const longestArabicText = await page
    .locator('main p')
    .evaluateAll((paragraphs) =>
      Math.max(...paragraphs.map((paragraph) => paragraph.textContent.trim().length)),
    );
  expect(longestArabicText).toBeGreaterThan(100);
  await expectNoBlockingViolations(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/fa/guides/security');
  await expectResponsivePage(page);
  await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const longestPersianText = await page
    .locator('main p')
    .evaluateAll((paragraphs) =>
      Math.max(...paragraphs.map((paragraph) => paragraph.textContent.trim().length)),
    );
  expect(longestPersianText).toBeGreaterThan(100);
  await page.getByRole('radio').nth(1).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expectNoBlockingViolations(page);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reducedMotionDuration = await page
    .getByRole('radio')
    .first()
    .evaluate(
      (element) =>
        Number(globalThis.getComputedStyle(element).transitionDuration.replace('s', '')) * 1000,
    );
  expect(reducedMotionDuration).toBeLessThanOrEqual(0.01);

  await page.goto('/');
  const { promise: navigationGate, resolve: releaseNavigation } =
    Promise.withResolvers<undefined>();
  await page.route('**/sign-in?motion-proof=1*', async (route) => {
    await navigationGate;
    await route.continue();
  });
  const signInLink = page.getByRole('link', { name: 'Sign in' }).first();
  await signInLink.evaluate((link) => {
    link.setAttribute('href', '/sign-in?motion-proof=1');
  });
  const navigation = signInLink.click();
  const skeleton = page.locator('.animate-pulse').first();
  await expect(skeleton).toBeVisible();
  const animation = await skeleton.evaluate((element) => {
    const style = globalThis.getComputedStyle(element);
    return {
      durationMs: Number(style.animationDuration.replace('s', '')) * 1000,
      iterationCount: style.animationIterationCount,
      name: style.animationName,
    };
  });
  expect(animation.durationMs).toBeLessThanOrEqual(0.01);
  expect(animation.iterationCount).toBe('1');
  expect(animation.name).toBe('none');
  releaseNavigation(undefined);
  await navigation;
  await page.unroute('**/sign-in?motion-proof=1*');

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/sign-in');
  await expectResponsivePage(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/forgot-password');
  await expectResponsivePage(page);
  await page.goto('/reset-password?token=responsive-proof');
  await expectResponsivePage(page);

  const account = buildAccount('responsive-proof');
  await signUp(page, account);
  await page.setViewportSize({ width: 768, height: 1024 });
  await expectResponsivePage(page);
  await page.goto('/dashboard/settings');
  await expectResponsivePage(page);

  const arabicSlug = await publishLongTranslatedPortfolio(
    page,
    account.email,
    'ar',
    'ملف مهني عربي طويل للاختبار',
    'مهندسة منصات تبني أنظمة موثوقة وآمنة وقابلة للتوسع للفرق الدولية متعددة اللغات',
    'أقود تصميم الأنظمة الموزعة وأراجع القرارات التقنية بعناية، مع توثيق واضح للحدود الأمنية ومسارات الفشل وخطط الاستعادة. أعمل مع فرق متعددة التخصصات لتحويل المتطلبات المعقدة إلى خدمات مستقرة يمكن مراقبتها وصيانتها وتطويرها دون التضحية بخصوصية المستخدم أو دقة المحتوى المهني المنشور.',
  );
  const persianSlug = await publishLongTranslatedPortfolio(
    page,
    account.email,
    'fa',
    'نمونه\u{200C}کار حرفه\u{200C}ای فارسی برای آزمون',
    'مهندس پلتفرم با تمرکز بر سامانه های امن، پایدار و قابل توسعه برای تیم های چند زبانه',
    'معماری سامانه های توزیع شده را با توجه دقیق به حریم خصوصی، مسیرهای خرابی، مشاهده پذیری و بازیابی طراحی می کنم. تجربه همکاری با تیم های محصول و زیرساخت را دارم و تصمیم های فنی پیچیده را به راهکارهایی روشن، قابل نگهداری و مستند تبدیل می کنم تا اطلاعات حرفه ای بدون حدس یا محتوای ساختگی منتشر شوند.',
  );
  const privateSlug = await createPrivateChallenge(page);

  await page.setViewportSize({ width: 667, height: 375 });
  await expectResponsivePage(page);
  await openImport(page);
  await expectResponsivePage(page);

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`/ar/${arabicSlug}`);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const renderedArabicSummary = page.getByText(/أقود تصميم الأنظمة الموزعة/u);
  await expect(renderedArabicSummary).toBeVisible();
  expect((await renderedArabicSummary.textContent())?.length).toBeGreaterThan(250);
  await expectResponsivePage(page);
  await page.goto(`/fa/${persianSlug}`);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const renderedPersianSummary = page.getByText(/معماری سامانه های توزیع شده/u);
  await expect(renderedPersianSummary).toBeVisible();
  expect((await renderedPersianSummary.textContent())?.length).toBeGreaterThan(250);
  await expectResponsivePage(page);
  await expectNoBlockingViolations(page);

  const visitor = await browser.newContext({ viewport: { width: 320, height: 720 } });
  const privatePage = await visitor.newPage();
  await privatePage.goto(`/${privateSlug}/notes`);
  await expect(privatePage.getByRole('heading', { name: /private page/i })).toBeVisible();
  await expectResponsivePage(privatePage);
  await visitor.close();
});
