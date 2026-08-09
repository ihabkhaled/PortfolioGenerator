import { describe, expect, it } from 'vitest';

import { addImportedResumeAttachment } from '@/modules/resume-ingestion';
import { buildFullPortfolioDocument } from '@/tests/fixtures/portfolio-document.fixtures';

describe('addImportedResumeAttachment', () => {
  it('adds the scanned CV as a hidden owner-reviewable attachment', () => {
    const document = buildFullPortfolioDocument();

    const next = addImportedResumeAttachment(document, {
      assetId: 'asset-imported-cv',
      fileName: 'Ihab CV.pdf',
      contentType: 'application/pdf',
      sizeBytes: 4096,
    });

    expect(next.attachments.at(-1)).toEqual({
      id: 'attachment-asset-imported-cv',
      kind: 'cv',
      label: 'Ihab CV.pdf',
      assetId: 'asset-imported-cv',
      fileName: 'Ihab CV.pdf',
      contentType: 'application/pdf',
      sizeBytes: 4096,
      visible: false,
    });
  });
});
