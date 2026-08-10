import { PDFDocument } from 'pdf-lib';

/**
 * Owner of `pdf-lib`.
 *
 * The portfolio download is built by printing each of a portfolio's public
 * pages separately — see `browser-print.ts` — and concatenating the results
 * here, rather than by building one composite render route. Reusing the real,
 * already-authorized public page for every navigation is a smaller, safer
 * surface than a second render path that would need its own review; the cost
 * is one merge step, and `pdf-lib` is pure JavaScript with no native
 * dependency, which keeps it cheap in a serverless function.
 *
 * No `server-only` guard: unlike the browser automation next to it, this file
 * touches nothing but byte buffers and is exercised directly in the unit
 * suite against real, tiny PDFs produced by `pdf-lib` itself.
 */
export async function mergePdfPages(pages: readonly Uint8Array[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create();

  // Sequential on purpose: every iteration mutates the one shared `merged`
  // document, so loading pages concurrently would race on the same instance.
  for (const bytes of pages) {
    const source = await PDFDocument.load(bytes);
    const copiedPages = await merged.copyPages(source, source.getPageIndices());

    for (const page of copiedPages) {
      merged.addPage(page);
    }
  }

  return merged.save();
}
