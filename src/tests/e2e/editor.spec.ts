import { expect, test } from '@playwright/test';

import { buildAccount, createPortfolio, signIn, signUp } from './support/accounts';

function firstField(
  fields: Readonly<Record<string, readonly [string, string]>>,
): readonly [string, readonly [string, string]] {
  const first = Object.entries(fields)[0];
  if (first === undefined) throw new Error('Each collection case must name an editable field');
  return first;
}

function editedFieldValue(label: string, value: string): string {
  return label === 'URL' ? 'https://example.com/edited' : `${value} edited`;
}

test.describe('collection and page authoring', () => {
  interface CollectionCase {
    readonly heading: string;
    readonly fields: Readonly<Record<string, readonly [string, string]>>;
  }

  const collectionCases: readonly CollectionCase[] = [
    {
      heading: 'Experience',
      fields: {
        Organization: ['First studio', 'Second studio'],
        Title: ['Engineer', 'Lead'],
      },
    },
    { heading: 'Projects', fields: { Name: ['First project', 'Second project'] } },
    { heading: 'Skills', fields: { Label: ['Backend', 'Frontend'] } },
    { heading: 'Soft skills', fields: { Label: ['Mentoring', 'Facilitation'] } },
    { heading: 'Education', fields: { Institution: ['North University', 'South University'] } },
    { heading: 'Courses', fields: { Name: ['Distributed systems', 'Security engineering'] } },
    { heading: 'Certifications', fields: { Name: ['Cloud certificate', 'Security certificate'] } },
    { heading: 'Languages', fields: { Name: ['Arabic', 'French'] } },
    { heading: 'Awards', fields: { Name: ['First award', 'Second award'] } },
    { heading: 'Publications', fields: { Title: ['Reliable queues', 'Safe migrations'] } },
    { heading: 'Volunteering', fields: { Organization: ['Code club', 'Science club'] } },
    {
      heading: 'Testimonials',
      fields: {
        Quote: ['Dependable collaborator', 'Clear technical leader'],
        Author: ['Amina', 'Samir'],
      },
    },
    {
      heading: 'Social links',
      fields: { URL: ['https://example.com/first', 'https://example.com/second'] },
    },
  ];

  test('round-trips add, edit, reorder and delete for every canonical collection', async ({
    page,
  }) => {
    const account = buildAccount('editor-collections');
    await signUp(page, account);
    await createPortfolio(page, 'Complete Collection Owner');

    for (const collectionCase of collectionCases) {
      const collection = page.locator('section').filter({
        has: page.getByRole('heading', { name: collectionCase.heading, exact: true }),
      });
      await collection.getByRole('button', { name: 'Add entry' }).click();
      await collection.getByRole('button', { name: 'Add entry' }).click();
      for (const [label, values] of Object.entries(collectionCase.fields)) {
        await collection.getByLabel(label, { exact: true }).nth(0).fill(values[0]);
        await collection.getByLabel(label, { exact: true }).nth(1).fill(values[1]);
      }
      await collection.getByRole('button', { name: 'Move entry up' }).nth(1).click();
    }
    const interests = page.getByLabel('Interests', { exact: true });
    await interests.fill('Architecture, Typography');
    await interests.fill('Typography, Architecture');

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Saved').first()).toBeVisible();
    await page.reload();

    for (const collectionCase of collectionCases) {
      const collection = page.locator('section').filter({
        has: page.getByRole('heading', { name: collectionCase.heading, exact: true }),
      });
      for (const [label, values] of Object.entries(collectionCase.fields)) {
        await expect(collection.getByLabel(label, { exact: true }).nth(0)).toHaveValue(values[1]);
        await collection
          .getByLabel(label, { exact: true })
          .nth(0)
          .fill(editedFieldValue(label, values[1]));
      }
    }
    await expect(interests).toHaveValue('Typography, Architecture');
    await interests.fill('Typography edited, Architecture');

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Saved').first()).toBeVisible();
    await page.reload();

    for (const collectionCase of collectionCases) {
      const collection = page.locator('section').filter({
        has: page.getByRole('heading', { name: collectionCase.heading, exact: true }),
      });
      for (const [label, values] of Object.entries(collectionCase.fields)) {
        await expect(collection.getByLabel(label, { exact: true }).nth(0)).toHaveValue(
          editedFieldValue(label, values[1]),
        );
      }
      await collection.getByRole('button', { name: 'Remove entry' }).nth(0).click();
      const [label, values] = firstField(collectionCase.fields);
      await expect(collection.getByLabel(label, { exact: true }).nth(0)).toHaveValue(values[0]);
    }
    await expect(interests).toHaveValue('Typography edited, Architecture');
    await interests.fill('Architecture');

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Saved').first()).toBeVisible();
    await page.reload();

    for (const collectionCase of collectionCases) {
      const collection = page.locator('section').filter({
        has: page.getByRole('heading', { name: collectionCase.heading, exact: true }),
      });
      const [label, values] = firstField(collectionCase.fields);
      await expect(collection.getByLabel(label, { exact: true })).toHaveCount(1);
      await expect(collection.getByLabel(label, { exact: true })).toHaveValue(values[0]);
    }
    await expect(interests).toHaveValue('Architecture');
  });

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

  test('round-trips page metadata, ordering and deletion', async ({ page }) => {
    const account = buildAccount('editor-pages');
    await signUp(page, account);
    await createPortfolio(page, 'Page Workflow Owner');
    const pageCreationForm = page.locator('form').filter({
      has: page.getByRole('button', { name: 'Add page' }),
    });

    for (const [title, nav, slug] of [
      ['First notes', 'First', 'first-notes'],
      ['Second notes', 'Second', 'second-notes'],
    ] as const) {
      await pageCreationForm.getByLabel('Page title').fill(title);
      await pageCreationForm.getByLabel('Navigation label').fill(nav);
      await pageCreationForm.getByLabel('Address').fill(slug);
      await pageCreationForm.getByRole('button', { name: 'Add page' }).click();
    }

    const pages = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Pages', exact: true }),
    });
    await pages.getByRole('button', { name: 'Move page up' }).last().click();
    await pages.getByLabel('Page title').nth(1).fill('Second notes edited');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Saved').first()).toBeVisible();
    await page.reload();

    await expect(pages.getByLabel('Page title').nth(1)).toHaveValue('Second notes edited');
    await expect(pages.getByLabel('Address').nth(0)).toHaveValue('');
    await expect(pages.getByLabel('Address').nth(1)).toHaveValue('second-notes');
    await expect(pages.getByLabel('Address').nth(2)).toHaveValue('first-notes');
    await pages.getByRole('button', { name: 'Remove page' }).nth(1).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Saved').first()).toBeVisible();
    await page.reload();
    await expect(pages.getByLabel('Page title')).toHaveCount(2);
    await expect(pages.getByLabel('Page title').nth(1)).toHaveValue('First notes');
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

  test('rejects a stale save from a second authenticated tab', async ({ page, browser }) => {
    const account = buildAccount('editor-stale');
    await signUp(page, account);
    await createPortfolio(page, 'Concurrent Editor');
    const editorUrl = page.url();

    const secondContext = await browser.newContext();
    const secondPage = await secondContext.newPage();
    await signIn(secondPage, account);
    await secondPage.goto(editorUrl);

    await page.getByLabel('Headline').fill('First writer');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Saved').first()).toBeVisible();

    await secondPage.getByLabel('Headline').fill('Stale writer');
    await secondPage.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(secondPage.getByRole('alert')).toContainText('changed in another tab');
    await secondContext.close();
  });
});
