import { describe, expect, it } from 'vitest';

import {
  isAssetReferencedOnPage,
  isPublishedAssetReferenced,
  toAssetRecord,
} from '@/modules/assets';
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

  it('allows a referenced asset only through its exact private page grant route', () => {
    const fixture = buildFullPortfolioDocument();
    const aboutSections =
      fixture.pages[0]?.sections.filter((section) => section.type === 'about') ?? [];
    const document = {
      ...fixture,
      attachments: [
        {
          id: 'private-resume',
          kind: 'cv' as const,
          label: 'Private resume',
          assetId: 'private-resume-asset',
          fileName: 'resume.pdf',
          contentType: 'application/pdf',
          sizeBytes: 1024,
          visible: true,
        },
      ],
      pages: fixture.pages.map((page) =>
        page.slug === 'notes'
          ? {
              ...page,
              visible: true,
              visibility: 'private' as const,
              passwordHash: 'hashed-password',
              sections: aboutSections,
            }
          : page,
      ),
    };

    expect(isAssetReferencedOnPage(document, 'notes', 'private-resume-asset')).toBe(true);
    expect(isAssetReferencedOnPage(document, 'notes', 'asset-gallery-1')).toBe(true);
    expect(isAssetReferencedOnPage(document, 'projects', 'private-resume-asset')).toBe(false);
  });

  it('authorizes portrait and project media only when the exact private page renders them', () => {
    const fixture = buildFullPortfolioDocument();
    const project = fixture.projects[0];
    if (project === undefined) throw new Error('The full fixture must contain a project');
    const renderedSections = fixture.pages[0]?.sections
      .filter((section) => section.type === 'hero' || section.type === 'projects')
      .map((section) =>
        section.type === 'hero'
          ? { ...section, config: { ...section.config, showPortrait: true } }
          : section,
      );
    if (renderedSections === undefined) throw new Error('The fixture must contain a home page');
    const document = {
      ...fixture,
      identity: { ...fixture.identity, portraitAssetId: 'private-portrait' },
      projects: [{ ...project, coverAssetId: 'private-cover' }],
      pages: fixture.pages.map((page) =>
        page.slug === 'notes'
          ? {
              ...page,
              visible: true,
              visibility: 'private' as const,
              passwordHash: 'hashed-password',
              sections: renderedSections,
            }
          : page,
      ),
    };

    expect(isAssetReferencedOnPage(document, 'notes', 'private-portrait')).toBe(true);
    expect(isAssetReferencedOnPage(document, 'notes', 'private-cover')).toBe(true);
    expect(isAssetReferencedOnPage(document, 'missing', 'private-cover')).toBe(false);
  });

  it('requires the matching gallery or attachment section before private media is reachable', () => {
    const fixture = buildFullPortfolioDocument();
    const withoutMediaSections = {
      ...fixture,
      pages: fixture.pages.map((page) =>
        page.slug === 'notes'
          ? {
              ...page,
              visible: true,
              visibility: 'private' as const,
              passwordHash: 'hashed-password',
              sections: [],
            }
          : page,
      ),
    };

    expect(isAssetReferencedOnPage(withoutMediaSections, 'notes', 'asset-gallery-1')).toBe(false);
    expect(isAssetReferencedOnPage(withoutMediaSections, 'notes', 'asset-cv')).toBe(false);

    const withMediaSections = {
      ...withoutMediaSections,
      pages: withoutMediaSections.pages.map((page) =>
        page.slug === 'notes'
          ? {
              ...page,
              sections: [
                {
                  id: 'private-gallery',
                  type: 'gallery' as const,
                  visible: true,
                  order: 10,
                  config: { title: null },
                },
                {
                  id: 'private-attachments',
                  type: 'attachments' as const,
                  visible: true,
                  order: 20,
                  config: { title: null },
                },
              ],
            }
          : page,
      ),
    };

    expect(isAssetReferencedOnPage(withMediaSections, 'notes', 'asset-gallery-1')).toBe(true);
    expect(isAssetReferencedOnPage(withMediaSections, 'notes', 'asset-cv')).toBe(true);
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
      objectDeletedAt: null,
      deletionAttempts: 0,
      deletionRetryAt: null,
    };

    expect(toAssetRecord(row)).toEqual({ ...row, purpose: 'portrait', visibility: 'public' });
  });
});
