import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';

import { mergePdfPages } from './pdf-merge';

/** A tiny, real, valid PDF — `pdf-lib` itself, not a fixture file. */
async function buildTestPdf(pageCount: number): Promise<Uint8Array> {
  const document = await PDFDocument.create();

  for (let index = 0; index < pageCount; index += 1) {
    document.addPage([200, 200]);
  }

  return document.save();
}

describe('mergePdfPages', () => {
  it('concatenates every page from every document, in order', async () => {
    const first = await buildTestPdf(1);
    const second = await buildTestPdf(2);

    const merged = await mergePdfPages([first, second]);
    const result = await PDFDocument.load(merged);

    expect(result.getPageCount()).toBe(3);
  });

  it('produces a loadable PDF from a single input', async () => {
    const only = await buildTestPdf(2);

    const merged = await mergePdfPages([only]);
    const result = await PDFDocument.load(merged);

    expect(result.getPageCount()).toBe(2);
  });

  it('still produces a loadable PDF for no input pages', async () => {
    // The caller guards this case upstream (nothing public to render means no
    // generation is attempted at all) — this only proves the function itself
    // never produces a corrupt file. pdf-lib inserts one blank page rather
    // than saving a zero-page document, which the PDF spec disallows.
    const merged = await mergePdfPages([]);

    await expect(PDFDocument.load(merged)).resolves.toBeDefined();
  });
});
