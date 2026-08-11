import { expect, test } from '@playwright/test';

import {
  buildAccount,
  createPortfolio,
  openEditorDisclosure,
  openEditorPageEntries,
  openNestedEditorDisclosures,
  saveEditor,
  signIn,
  signUp,
} from './support/accounts';

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

async function configureCollectionCase(
  heading: string,
  collection: Awaited<ReturnType<typeof openEditorDisclosure>>,
): Promise<void> {
  if (heading !== 'Social links') return;

  await collection.getByLabel('Platform').nth(0).selectOption('github');
  await collection.getByLabel('Platform').nth(1).selectOption('linkedin');
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
    { heading: 'Technical skill groups', fields: { Label: ['Backend', 'Frontend'] } },
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

  const collectionGroups = [
    collectionCases.slice(0, 5),
    collectionCases.slice(5, 9),
    collectionCases.slice(9),
  ];

  for (const [groupIndex, collectionGroup] of collectionGroups.entries()) {
    test(`round-trips canonical collection group ${groupIndex + 1}`, async ({ page }) => {
      const account = buildAccount(`editor-collections-${groupIndex + 1}`);
      await signUp(page, account);
      await createPortfolio(page, 'Complete Collection Owner');
      await openEditorDisclosure(page, 'Portfolio content');

      for (const collectionCase of collectionGroup) {
        const collection = await openEditorDisclosure(page, collectionCase.heading);
        await collection.getByRole('button', { name: 'Add entry' }).click();
        await collection.getByRole('button', { name: 'Add entry' }).click();
        await openNestedEditorDisclosures(collection);
        for (const [label, values] of Object.entries(collectionCase.fields)) {
          await collection.getByLabel(label).nth(0).fill(values[0]);
          await collection.getByLabel(label).nth(1).fill(values[1]);
        }
        await configureCollectionCase(collectionCase.heading, collection);
        await collection.getByRole('button', { name: 'Move entry up' }).nth(1).click();
      }
      const interests = page.getByLabel('Interests, separated by commas', { exact: true });
      await interests.fill('Architecture, Typography');
      await interests.fill('Typography, Architecture');

      await saveEditor(page);
      await expect(page.getByText('Saved').first()).toBeVisible();
      await page.reload();
      await openEditorDisclosure(page, 'Portfolio content');

      for (const collectionCase of collectionGroup) {
        const collection = await openEditorDisclosure(page, collectionCase.heading);
        await openNestedEditorDisclosures(collection);
        for (const [label, values] of Object.entries(collectionCase.fields)) {
          await expect(collection.getByLabel(label).nth(0)).toHaveValue(values[1]);
          await collection.getByLabel(label).nth(0).fill(editedFieldValue(label, values[1]));
        }
      }
      await expect(interests).toHaveValue('Typography, Architecture');
      await interests.fill('Typography edited, Architecture');

      await saveEditor(page);
      await expect(page.getByText('Saved').first()).toBeVisible();
      await page.reload();
      await openEditorDisclosure(page, 'Portfolio content');

      for (const collectionCase of collectionGroup) {
        const collection = await openEditorDisclosure(page, collectionCase.heading);
        await openNestedEditorDisclosures(collection);
        for (const [label, values] of Object.entries(collectionCase.fields)) {
          await expect(collection.getByLabel(label).nth(0)).toHaveValue(
            editedFieldValue(label, values[1]),
          );
        }
        await collection.getByRole('button', { name: 'Remove entry' }).nth(0).click();
        const [label, values] = firstField(collectionCase.fields);
        await expect(collection.getByLabel(label).nth(0)).toHaveValue(values[0]);
      }
      await expect(interests).toHaveValue('Typography edited, Architecture');
      await interests.fill('Architecture');

      await saveEditor(page);
      await expect(page.getByText('Saved').first()).toBeVisible();
      await page.reload();
      await openEditorDisclosure(page, 'Portfolio content');

      for (const collectionCase of collectionGroup) {
        const collection = await openEditorDisclosure(page, collectionCase.heading);
        await openNestedEditorDisclosures(collection);
        const [label, values] = firstField(collectionCase.fields);
        await expect(collection.getByLabel(label)).toHaveCount(1);
        await expect(collection.getByLabel(label)).toHaveValue(values[0]);
      }
      await expect(interests).toHaveValue('Architecture');
    });
  }

  test('persists a project and its page through save and reload', async ({ page }) => {
    const account = buildAccount('editor-content');

    await signUp(page, account);
    await createPortfolio(page, 'Editor Owner');
    await openEditorDisclosure(page, 'Portfolio content');
    const projects = await openEditorDisclosure(page, 'Projects');
    await projects.getByRole('button', { name: 'Add entry' }).click();
    await openNestedEditorDisclosures(projects);
    await projects.getByLabel('Name').fill('Fault-tolerant scheduler');
    await projects.getByLabel('Project address').fill('scheduler');
    await projects.getByLabel('Summary').fill('A scheduler designed around predictable recovery.');

    await openEditorDisclosure(page, 'Pages');
    await page.locator('#new-page-title').fill('Field notes');
    await page.locator('#new-page-nav').fill('Notes');
    await page.locator('#new-page-slug').fill('notes');
    await page.getByRole('button', { name: 'Add page' }).click();

    await saveEditor(page);
    await expect(page.getByText('Saved').first()).toBeVisible();
    await page.reload();
    await openEditorDisclosure(page, 'Portfolio content');
    const reloadedProjects = await openEditorDisclosure(page, 'Projects');
    await openNestedEditorDisclosures(reloadedProjects);
    const reloadedPages = await openEditorPageEntries(page);

    await expect(reloadedProjects.getByLabel('Name')).toHaveValue('Fault-tolerant scheduler');
    await expect(reloadedPages.getByLabel('Page title').last()).toHaveValue('Field notes');
    await expect(reloadedPages.getByLabel('Address').last()).toHaveValue('notes');
  });

  test('round-trips page metadata, ordering and deletion', async ({ page }) => {
    const account = buildAccount('editor-pages');
    await signUp(page, account);
    await createPortfolio(page, 'Page Workflow Owner');
    await openEditorDisclosure(page, 'Pages');
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

    const pages = await openEditorPageEntries(page);
    await pages.getByRole('button', { name: 'Move page up' }).last().click();
    await pages.getByLabel('Page title').nth(1).fill('Second notes edited');
    await saveEditor(page);
    await expect(page.getByText('Saved').first()).toBeVisible();
    await page.reload();
    const reloadedPages = await openEditorPageEntries(page);

    await expect(reloadedPages.getByLabel('Page title').nth(1)).toHaveValue('Second notes edited');
    await expect(reloadedPages.getByLabel('Address').nth(0)).toHaveValue('');
    await expect(reloadedPages.getByLabel('Address').nth(1)).toHaveValue('second-notes');
    await expect(reloadedPages.getByLabel('Address').nth(2)).toHaveValue('first-notes');
    await reloadedPages.getByRole('button', { name: 'Remove page' }).nth(1).click();
    await saveEditor(page);
    await expect(page.getByText('Saved').first()).toBeVisible();
    await page.reload();
    const finalPages = await openEditorPageEntries(page);
    await expect(finalPages.getByLabel('Page title')).toHaveCount(2);
    await expect(finalPages.getByLabel('Page title').nth(1)).toHaveValue('First notes');
  });

  test('reorders collection entries without losing their values', async ({ page }) => {
    const account = buildAccount('editor-order');

    await signUp(page, account);
    await createPortfolio(page, 'Ordering Owner');
    await openEditorDisclosure(page, 'Portfolio content');
    const awards = await openEditorDisclosure(page, 'Awards');
    await awards.getByRole('button', { name: 'Add entry' }).click();
    await awards.getByRole('button', { name: 'Add entry' }).click();
    await openNestedEditorDisclosures(awards);
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
    await saveEditor(page);
    await expect(page.getByText('Saved').first()).toBeVisible();

    await secondPage.getByLabel('Headline').fill('Stale writer');
    const staleSaveButton = secondPage
      .locator('[data-fixed-surface="editor-actions"]')
      .getByRole('button', { name: 'Save', exact: true });
    await expect(staleSaveButton).toBeEnabled();
    await staleSaveButton.click();
    await expect(
      secondPage.getByRole('alert').filter({ hasText: 'changed somewhere else' }),
    ).toBeVisible();
    await secondContext.close();
  });
});
