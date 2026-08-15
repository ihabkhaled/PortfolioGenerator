import { describe, expect, it } from 'vitest';

import { upgradeDocumentToVersion5 } from '@/modules/portfolio-document';

describe('document v5 migration', () => {
  it('leaves non-object input unchanged', () => {
    expect(upgradeDocumentToVersion5(null)).toBeNull();
    expect(upgradeDocumentToVersion5('not-a-document')).toBe('not-a-document');
  });

  it('adds empty company and source-order defaults to published v4 documents', () => {
    const migrated = upgradeDocumentToVersion5({
      schemaVersion: 4,
      source: { kind: 'manual', resumeUploadId: null },
    }) as Record<string, unknown>;
    expect(migrated['schemaVersion']).toBe(5);
    expect(migrated['companies']).toEqual([]);
    expect(migrated['source']).toEqual({ kind: 'manual', resumeUploadId: null, pageOrder: null });
  });

  it('normalizes malformed v5 metadata without inventing values', () => {
    const migrated = upgradeDocumentToVersion5({
      schemaVersion: 4,
      companies: 'bad',
      source: { kind: 'manual', pageOrder: 'bad' },
    }) as Record<string, unknown>;
    expect(migrated['companies']).toEqual([]);
    expect((migrated['source'] as Record<string, unknown>)['pageOrder']).toBeNull();
  });

  it('keeps valid companies, drops malformed entries, and preserves observed page order', () => {
    const migrated = upgradeDocumentToVersion5({
      schemaVersion: 4,
      companies: [
        { id: 'company-1', name: 'Northstar Labs', sourceOrder: 0 },
        { id: 'bad', name: '' },
      ],
      source: { kind: 'import', pageOrder: ['page-1', 'page-2'] },
    }) as Record<string, unknown>;

    expect(migrated['companies']).toEqual([
      { id: 'company-1', name: 'Northstar Labs', sourceOrder: 0 },
    ]);
    expect((migrated['source'] as Record<string, unknown>)['pageOrder']).toEqual([
      'page-1',
      'page-2',
    ]);
  });

  it('does not manufacture source metadata when source is not an object', () => {
    const migrated = upgradeDocumentToVersion5({ schemaVersion: 4, source: null }) as Record<
      string,
      unknown
    >;

    expect(migrated['source']).toBeNull();
  });
});
