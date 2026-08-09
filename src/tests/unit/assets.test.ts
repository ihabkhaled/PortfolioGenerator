import { describe, expect, it } from 'vitest';

import { isPublishedAssetReferenced, toAssetRecord } from '@/modules/assets';
import { buildFullPortfolioDocument } from '@/tests/fixtures/portfolio-document.fixtures';

describe('isPublishedAssetReferenced', () => {
  it('allows a portrait referenced by the published document', () => {
    const fullDocumentFixture = buildFullPortfolioDocument();
    const document = {
      ...fullDocumentFixture,
      identity: { ...fullDocumentFixture.identity, portraitAssetId: 'portrait-asset' },
      pages: fullDocumentFixture.pages.map((page) => ({
        ...page,
        sections: page.sections.map((section) =>
          section.type === 'hero'
            ? { ...section, config: { ...section.config, showPortrait: true } }
            : section,
        ),
      })),
    };

    expect(isPublishedAssetReferenced(document, 'portrait-asset')).toBe(true);
  });

  it('allows visible attachments and refuses hidden attachments', () => {
    const fullDocumentFixture = buildFullPortfolioDocument();
    const document = {
      ...fullDocumentFixture,
      attachments: [
        {
          id: 'resume',
          kind: 'cv' as const,
          label: 'Download résumé',
          assetId: 'public-resume',
          fileName: 'resume.pdf',
          contentType: 'application/pdf',
          sizeBytes: 1024,
          visible: true,
        },
        {
          id: 'private-certificate',
          kind: 'certificate' as const,
          label: 'Private certificate',
          assetId: 'hidden-certificate',
          fileName: 'certificate.pdf',
          contentType: 'application/pdf',
          sizeBytes: 2048,
          visible: false,
        },
      ],
    };

    expect(isPublishedAssetReferenced(document, 'public-resume')).toBe(true);
    expect(isPublishedAssetReferenced(document, 'hidden-certificate')).toBe(false);
  });

  it('allows gallery and project-cover assets and refuses unrelated owned assets', () => {
    const fullDocumentFixture = buildFullPortfolioDocument();
    const project = fullDocumentFixture.projects[0];

    if (project === undefined) {
      throw new Error('The full fixture must contain a project');
    }

    const document = {
      ...fullDocumentFixture,
      projects: [{ ...project, coverAssetId: 'project-cover' }],
      gallery: [
        { id: 'gallery-1', assetId: 'gallery-image', alt: 'Conference stage', caption: null },
      ],
    };

    expect(isPublishedAssetReferenced(document, 'project-cover')).toBe(true);
    expect(isPublishedAssetReferenced(document, 'gallery-image')).toBe(true);
    expect(isPublishedAssetReferenced(document, 'unrelated-owned-asset')).toBe(false);
  });

  it('refuses references exposed only by a private or hidden page', () => {
    const fullDocumentFixture = buildFullPortfolioDocument();
    const document = {
      ...fullDocumentFixture,
      attachments: [
        {
          id: 'resume',
          kind: 'cv' as const,
          label: 'Download resume',
          assetId: 'private-page-resume',
          fileName: 'resume.pdf',
          contentType: 'application/pdf',
          sizeBytes: 1024,
          visible: true,
        },
      ],
      pages: fullDocumentFixture.pages.map((page) => ({
        ...page,
        visible: false,
        visibility: 'private' as const,
        passwordHash: 'hashed-password',
      })),
    };

    expect(isPublishedAssetReferenced(document, 'private-page-resume')).toBe(false);
  });

  it('refuses references when their rendering section is hidden', () => {
    const fullDocumentFixture = buildFullPortfolioDocument();
    const document = {
      ...fullDocumentFixture,
      attachments: [
        {
          id: 'resume',
          kind: 'cv' as const,
          label: 'Download resume',
          assetId: 'hidden-section-resume',
          fileName: 'resume.pdf',
          contentType: 'application/pdf',
          sizeBytes: 1024,
          visible: true,
        },
      ],
      pages: fullDocumentFixture.pages.map((page) => ({
        ...page,
        sections: page.sections.map((section) => ({ ...section, visible: false })),
      })),
    };

    expect(isPublishedAssetReferenced(document, 'hidden-section-resume')).toBe(false);
  });
});

describe('toAssetRecord', () => {
  it('maps database enums while preserving the stored asset fields', () => {
    const createdAt = new Date('2026-08-09T12:00:00.000Z');
    const row = {
      id: 'asset-1',
      ownerId: 'owner-1',
      portfolioId: 'portfolio-1',
      purpose: 'PORTRAIT' as const,
      visibility: 'PUBLIC' as const,
      storageKey: 'owners/owner-1/portrait.png',
      originalFilename: 'portrait.png',
      contentType: 'image/png',
      extension: '.png',
      sizeBytes: 2048,
      sha256: 'digest',
      width: 800,
      height: 800,
      createdAt,
      deletedAt: null,
    };

    expect(toAssetRecord(row)).toEqual({ ...row, purpose: 'portrait', visibility: 'public' });
  });
});
