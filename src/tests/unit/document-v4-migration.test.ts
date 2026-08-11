import { describe, expect, it } from 'vitest';

import {
  createEmptyPortfolioDocument,
  migratePortfolioDocument,
  PORTFOLIO_SCHEMA_VERSION,
  upgradeDocumentToVersion4,
} from '@/modules/portfolio-document';

describe('upgradeDocumentToVersion4', () => {
  it('passes non-record input through for canonical validation', () => {
    expect(upgradeDocumentToVersion4('not a document')).toBe('not a document');
  });

  it('leaves a malformed non-record identity for canonical validation', () => {
    expect(upgradeDocumentToVersion4({ schemaVersion: 3, identity: 'invalid' })).toEqual({
      schemaVersion: 4,
      identity: 'invalid',
    });
  });

  it('adds reviewable sensitive identity fields without inventing values', () => {
    const legacy = { ...createEmptyPortfolioDocument('Jane Doe'), schemaVersion: 3 };
    const upgraded = upgradeDocumentToVersion4(legacy) as typeof legacy & {
      identity: Record<string, unknown>;
    };

    expect(upgraded.schemaVersion).toBe(4);
    expect(upgraded.identity.nationality).toBeNull();
    expect(upgraded.identity.militaryStatus).toBeNull();
  });

  it('discards arbitrary legacy sensitive values rather than trusting them', () => {
    const legacy = {
      ...createEmptyPortfolioDocument('Jane Doe'),
      schemaVersion: 3,
      identity: {
        ...createEmptyPortfolioDocument('Jane Doe').identity,
        nationality: 'Egyptian',
        militaryStatus: 'Completed',
      },
    };

    const upgraded = migratePortfolioDocument(legacy);

    expect(upgraded.schemaVersion).toBe(PORTFOLIO_SCHEMA_VERSION);
    expect(upgraded.identity.nationality).toBeNull();
    expect(upgraded.identity.militaryStatus).toBeNull();
  });
});
