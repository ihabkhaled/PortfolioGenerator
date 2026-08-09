import 'server-only';

import mammoth from 'mammoth';
import WordExtractor from 'word-extractor';

import { extractPdfText } from '@/packages/pdf';

import { inspectDocumentContainer } from './container-inspection';
import {
  DOCUMENT_TEXT_CONTENT_TYPES,
  ESTIMATED_CHARACTERS_PER_PAGE,
} from './document-text.constants';
import { DocumentTextError } from './document-text.error';
import type { DocumentTextInput, DocumentTextResult } from './document-text.types';
import { extractRtfText } from './rtf-text';

export { inspectDocumentContainer } from './container-inspection';
export { DocumentTextError } from './document-text.error';
export type {
  DocumentContainerKind,
  DocumentContentType,
  DocumentTextErrorCode,
  DocumentTextInput,
  DocumentTextResult,
} from './document-text.types';

export async function extractDocumentText(input: DocumentTextInput): Promise<DocumentTextResult> {
  const extracted = await extractByContentType(input.bytes, input.contentType);
  const pageCount =
    extracted.pageCount ??
    Math.max(
      1,
      extracted.text.split('\f').length,
      Math.ceil(extracted.text.length / ESTIMATED_CHARACTERS_PER_PAGE),
    );

  if (pageCount > input.maxPages) {
    throw new DocumentTextError('too-many-pages');
  }

  return {
    text: extracted.text.slice(0, input.maxCharacters),
    pageCount,
    wasTruncated: extracted.text.length > input.maxCharacters,
  };
}

export function inspectDocumentForText(bytes: Uint8Array, contentType: string): void {
  switch (contentType) {
    case DOCUMENT_TEXT_CONTENT_TYPES.pdf: {
      return;
    }

    case DOCUMENT_TEXT_CONTENT_TYPES.docx: {
      inspectDocumentContainer(bytes, 'docx');
      return;
    }

    case DOCUMENT_TEXT_CONTENT_TYPES.doc: {
      inspectDocumentContainer(bytes, 'doc');
      return;
    }

    case DOCUMENT_TEXT_CONTENT_TYPES.rtf: {
      inspectDocumentContainer(bytes, 'rtf');
      return;
    }

    default: {
      throw new DocumentTextError('unsupported-type');
    }
  }
}

export async function extractByContentType(
  bytes: Uint8Array,
  contentType: string,
): Promise<{ readonly text: string; readonly pageCount?: number }> {
  switch (contentType) {
    case DOCUMENT_TEXT_CONTENT_TYPES.pdf: {
      return extractPdfText(bytes);
    }

    case DOCUMENT_TEXT_CONTENT_TYPES.docx: {
      inspectDocumentContainer(bytes, 'docx');
      // Raw-text mode never resolves images. External relationships were
      // already rejected by the bounded container preflight above.
      const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
      return { text: result.value };
    }

    case DOCUMENT_TEXT_CONTENT_TYPES.doc: {
      inspectDocumentContainer(bytes, 'doc');
      const document = await new WordExtractor().extract(Buffer.from(bytes));
      return { text: document.getBody() };
    }

    case DOCUMENT_TEXT_CONTENT_TYPES.rtf: {
      inspectDocumentContainer(bytes, 'rtf');
      return { text: extractRtfText(bytes) };
    }

    default: {
      throw new DocumentTextError('unsupported-type');
    }
  }
}
