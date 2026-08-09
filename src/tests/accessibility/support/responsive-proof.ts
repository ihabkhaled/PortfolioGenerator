import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

const MINIMUM_TARGET_SIZE = 24;
const MINIMUM_SAFE_AREA_OFFSET = 16;
const VIEWPORT_TOLERANCE = 1;

interface Rectangle {
  readonly bottom: number;
  readonly height: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly width: number;
}

interface FixedControlEvidence {
  readonly hitTestVisible: boolean;
  readonly overlapsDocumentContent: boolean;
  readonly rectangle: Rectangle;
}

function rectanglesOverlap(first: Rectangle, second: Rectangle): boolean {
  return !(
    first.right <= second.left ||
    second.right <= first.left ||
    first.bottom <= second.top ||
    second.bottom <= first.top
  );
}

async function visibleRectangles(locator: Locator): Promise<readonly Rectangle[]> {
  return locator.evaluateAll((elements) =>
    elements.flatMap((element) => {
      const style = globalThis.getComputedStyle(element);
      const rectangle = element.getBoundingClientRect();

      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        rectangle.width === 0 ||
        rectangle.height === 0
      ) {
        return [];
      }

      return [
        {
          bottom: rectangle.bottom,
          height: rectangle.height,
          left: rectangle.left,
          right: rectangle.right,
          top: rectangle.top,
          width: rectangle.width,
        },
      ];
    }),
  );
}

export async function expectResponsivePage(page: Page): Promise<void> {
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('main')).toBeVisible();

  const documentWidth = await page.evaluate(() => globalThis.document.documentElement.scrollWidth);
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  expect(documentWidth).toBeLessThanOrEqual((viewport?.width ?? 0) + VIEWPORT_TOLERANCE);

  const targets = await visibleRectangles(
    page.locator(
      "a[href], button, input:not([type='hidden']), label, select, summary, textarea, [role='button'], [role='radio']",
    ),
  );
  for (const target of targets) {
    expect(target.width).toBeGreaterThanOrEqual(MINIMUM_TARGET_SIZE);
    expect(target.height).toBeGreaterThanOrEqual(MINIMUM_TARGET_SIZE);
  }

  await page.evaluate(() => {
    globalThis.scrollTo(0, globalThis.document.documentElement.scrollHeight);
  });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          globalThis.scrollY + globalThis.innerHeight >=
          globalThis.document.documentElement.scrollHeight - 1,
      ),
    )
    .toBe(true);

  const fixedControls = await page.locator('body aside').evaluateAll((elements) => {
    const meaningfulSelector = [
      'header',
      'main',
      'footer',
      'nav',
      'section',
      'article',
      'form',
      'fieldset',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'li',
      'dt',
      'dd',
      'a[href]',
      'button',
      'label',
      'input',
      'select',
      'textarea',
      'summary',
      'img',
      'figure',
      'blockquote',
      'pre',
    ].join(',');
    const semanticContent = [...globalThis.document.querySelectorAll(meaningfulSelector)];
    const directTextContent = [...globalThis.document.body.querySelectorAll('*')].filter((node) =>
      [...node.childNodes].some(
        (child) => child.nodeType === Node.TEXT_NODE && child.textContent?.trim() !== '',
      ),
    );
    const documentContent = [...semanticContent, ...directTextContent].filter(
      (content) => content.closest('[data-fixed-surface]') === null,
    );

    return elements.flatMap((element): FixedControlEvidence[] => {
      if (globalThis.getComputedStyle(element).position !== 'fixed') return [];
      const rectangle = element.getBoundingClientRect();
      if (rectangle.width === 0 || rectangle.height === 0) return [];
      const points = [
        [rectangle.left + 2, rectangle.top + 2],
        [rectangle.right - 2, rectangle.top + 2],
        [rectangle.left + rectangle.width / 2, rectangle.top + rectangle.height / 2],
        [rectangle.left + 2, rectangle.bottom - 2],
        [rectangle.right - 2, rectangle.bottom - 2],
      ] as const;
      const hitTestVisible = points.every(([x, y]) => {
        const hit = globalThis.document.elementFromPoint(x, y);
        return hit !== null && (hit === element || element.contains(hit));
      });
      const overlapsDocumentContent = documentContent.some((content) => {
        const style = globalThis.getComputedStyle(content);
        const target = content.getBoundingClientRect();
        if (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          target.width === 0 ||
          target.height === 0 ||
          target.right <= 0 ||
          target.bottom <= 0 ||
          target.left >= globalThis.innerWidth ||
          target.top >= globalThis.innerHeight
        ) {
          return false;
        }
        return !(
          rectangle.right <= target.left ||
          target.right <= rectangle.left ||
          rectangle.bottom <= target.top ||
          target.bottom <= rectangle.top
        );
      });

      return [
        {
          hitTestVisible,
          overlapsDocumentContent,
          rectangle: {
            bottom: rectangle.bottom,
            height: rectangle.height,
            left: rectangle.left,
            right: rectangle.right,
            top: rectangle.top,
            width: rectangle.width,
          },
        },
      ];
    });
  });

  for (const [index, control] of fixedControls.entries()) {
    expect(control.rectangle.left).toBeGreaterThanOrEqual(MINIMUM_SAFE_AREA_OFFSET);
    expect(control.rectangle.top).toBeGreaterThanOrEqual(0);
    expect(control.rectangle.right).toBeLessThanOrEqual(
      (viewport?.width ?? 0) - MINIMUM_SAFE_AREA_OFFSET + VIEWPORT_TOLERANCE,
    );
    expect(control.rectangle.bottom).toBeLessThanOrEqual(
      (viewport?.height ?? 0) - MINIMUM_SAFE_AREA_OFFSET + VIEWPORT_TOLERANCE,
    );
    expect(control.hitTestVisible).toBe(true);
    expect(control.overlapsDocumentContent).toBe(false);

    const remainingControls = fixedControls.slice(index + 1);
    for (const other of remainingControls) {
      expect(rectanglesOverlap(control.rectangle, other.rectangle)).toBe(false);
    }
  }
}
