import 'server-only';

import { extractText, getDocumentProxy } from 'unpdf';

/**
 * Owner of `unpdf`.
 *
 * A serverless-friendly PDF.js build. It runs locally, before any model sees
 * the document, which is the single most effective cost control in the
 * product: a text-layer PDF never becomes a multimodal request.
 *
 * The parser is also the most hostile-input-facing dependency here, so it is
 * confined to one file with a hard timeout and no filesystem or network access.
 */

export interface PdfTextResult {
  readonly text: string;
  readonly pageCount: number;
}

/**
 * Extract the embedded text layer.
 *
 * Throws rather than returning a partial result: the caller has a state machine
 * with a `FAILED_TEXT_EXTRACTION` state, and a silently empty string would be
 * indistinguishable from a scanned document that deserves a different message.
 */
export async function extractPdfText(bytes: Uint8Array): Promise<PdfTextResult> {
  const document = await getDocumentProxy(bytes);
  const { text, totalPages } = await extractText(document, { mergePages: true });

  return {
    text: Array.isArray(text) ? text.join('\n') : text,
    pageCount: totalPages,
  };
}

/** Page count alone, for the size check that runs before extraction. */
export async function readPdfPageCount(bytes: Uint8Array): Promise<number> {
  const document = await getDocumentProxy(bytes);

  return document.numPages;
}
