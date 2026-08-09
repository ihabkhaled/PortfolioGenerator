import { FILE_REJECTIONS } from '@/modules/file-security';
import type { FileRejection } from '@/modules/file-security';

import type { UploadRejection } from '../types/ingestion.types';

/**
 * Translate a file-security refusal into the vocabulary this module speaks.
 *
 * The two vocabularies are deliberately separate. File security knows about
 * signatures and extensions; ingestion knows about CVs. Mapping between them
 * here means the import screen keeps one closed set of messages, and a new
 * refusal reason in the security layer cannot silently reach a user as an
 * untranslated string.
 *
 * The collapse is lossy on purpose — a user does not need to know whether the
 * extension or the magic bytes disagreed, only that the file is not what it
 * claims. The precise reason is on the audit event.
 */
export function toUploadRejection(rejection: FileRejection): UploadRejection {
  switch (rejection) {
    case FILE_REJECTIONS.empty: {
      return 'empty';
    }

    case FILE_REJECTIONS.tooLarge: {
      return 'too-large';
    }

    case FILE_REJECTIONS.infected: {
      return 'infected';
    }

    case FILE_REJECTIONS.scannerUnavailable: {
      return 'scanner-unavailable';
    }

    default: {
      return 'type-mismatch';
    }
  }
}
