import { describe, expect, it } from 'vitest';

import { canPublishTranslation, selectTranslationForPublicRead } from '@/modules/localization';

describe('translation snapshot policy', () => {
  const draft = { schemaVersion: 2, identity: { displayName: 'Draft' } };
  const reviewed = { schemaVersion: 2, identity: { displayName: 'Reviewed' } };
  const published = { schemaVersion: 2, identity: { displayName: 'Published' } };

  it('requires a reviewed snapshot before publishing', () => {
    expect(canPublishTranslation({ reviewedDocument: null })).toBe(false);
    expect(canPublishTranslation({ reviewedDocument: reviewed })).toBe(true);
  });

  it('serves only the published snapshot on public reads', () => {
    expect(
      selectTranslationForPublicRead({
        draftDocument: draft,
        reviewedDocument: reviewed,
        publishedDocument: published,
      }),
    ).toBe(published);
    expect(
      selectTranslationForPublicRead({
        draftDocument: draft,
        reviewedDocument: reviewed,
        publishedDocument: null,
      }),
    ).toBeNull();
  });
});
