import type { DocumentTextErrorCode } from '@/packages/document-text';

import type { UploadRejection } from '../types/ingestion.types';

export function toDocumentTextRejection(code: DocumentTextErrorCode): UploadRejection {
  switch (code) {
    case 'too-many-pages': {
      return 'too-many-pages';
    }

    case 'unsafe-container': {
      return 'unsafe-document';
    }

    case 'corrupt-document':
    case 'unsupported-type': {
      return 'unreadable-document';
    }
  }
}
