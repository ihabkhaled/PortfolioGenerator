import type { PortfolioDocument } from '@/modules/portfolio-document';

import type { ImportedResumeAttachmentInput } from '../types/imported-resume-attachment.types';

/** Makes a verified source CV reviewable without making it public. */
export function addImportedResumeAttachment(
  document: PortfolioDocument,
  input: ImportedResumeAttachmentInput,
): PortfolioDocument {
  return {
    ...document,
    attachments: [
      ...document.attachments,
      {
        id: `attachment-${input.assetId}`,
        kind: 'cv',
        label: input.fileName,
        assetId: input.assetId,
        fileName: input.fileName,
        contentType: input.contentType,
        sizeBytes: input.sizeBytes,
        visible: false,
      },
    ],
  };
}
