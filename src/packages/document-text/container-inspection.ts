import { unzipSync } from 'fflate';

import {
  MAX_DOCX_COMPRESSION_RATIO,
  MAX_DOCX_ENTRIES,
  MAX_DOCX_UNCOMPRESSED_BYTES,
  UNSAFE_DOCX_PATH_PARTS,
  UNSAFE_OLE_MARKERS,
  UNSAFE_RTF_CONTROL_WORDS,
} from './document-text.constants';
import { DocumentTextError } from './document-text.error';
import type { DocumentContainerKind } from './document-text.types';

export function inspectDocumentContainer(bytes: Uint8Array, kind: DocumentContainerKind): void {
  switch (kind) {
    case 'docx': {
      inspectDocx(bytes);
      return;
    }

    case 'doc': {
      inspectOle(bytes);
      return;
    }

    case 'rtf': {
      inspectRtf(bytes);
    }
  }
}

export function inspectDocx(bytes: Uint8Array): void {
  let entries = 0;
  let uncompressedBytes = 0;

  try {
    const selected = unzipSync(bytes, {
      filter(file) {
        entries += 1;
        uncompressedBytes += file.originalSize;
        const normalizedName = `/${file.name.toLowerCase()}`;
        const ratio = file.size === 0 ? file.originalSize : file.originalSize / file.size;

        if (
          entries > MAX_DOCX_ENTRIES ||
          uncompressedBytes > MAX_DOCX_UNCOMPRESSED_BYTES ||
          ratio > MAX_DOCX_COMPRESSION_RATIO ||
          UNSAFE_DOCX_PATH_PARTS.some((part) => normalizedName.includes(part))
        ) {
          throw new DocumentTextError('unsafe-container');
        }

        return normalizedName.endsWith('.rels');
      },
    });

    for (const [name, content] of Object.entries(selected)) {
      const relationships = new TextDecoder().decode(content);

      if (/TargetMode\s*=\s*["']External["']/iu.test(relationships)) {
        throw new DocumentTextError('unsafe-container');
      }

      if (!name.toLowerCase().endsWith('.rels')) {
        throw new DocumentTextError('corrupt-document');
      }
    }
  } catch (error) {
    if (error instanceof DocumentTextError) {
      throw error;
    }

    throw new DocumentTextError('corrupt-document');
  }
}

export function inspectRtf(bytes: Uint8Array): void {
  const source = new TextDecoder('latin1').decode(bytes).toLowerCase();

  if (UNSAFE_RTF_CONTROL_WORDS.some((controlWord) => source.includes(controlWord))) {
    throw new DocumentTextError('unsafe-container');
  }
}

export function inspectOle(bytes: Uint8Array): void {
  const latin = new TextDecoder('latin1').decode(bytes);
  const utf16 = new TextDecoder('utf-16le').decode(bytes);

  if (UNSAFE_OLE_MARKERS.some((marker) => latin.includes(marker) || utf16.includes(marker))) {
    throw new DocumentTextError('unsafe-container');
  }
}
