import {
  publishOwnedTranslationSnapshotForTest as publishOwnedTranslationSnapshotForTestInDatabase,
  readOwnedAssetStorageKey as readOwnedAssetStorageKeyFromDatabase,
  readOwnedPublishedDocument as readOwnedPublishedDocumentFromDatabase,
} from '@/packages/database/test-support';

interface OwnedAssetLookup {
  readonly ownerEmail: string;
  readonly assetId: string;
}

export function readOwnedAssetStorageKey(input: OwnedAssetLookup): Promise<string> {
  const databaseUrl = process.env['DATABASE_URL'];
  if (databaseUrl === undefined) throw new Error('DATABASE_URL is required for E2E support');

  return readOwnedAssetStorageKeyFromDatabase({ ...input, databaseUrl });
}

interface OwnedPortfolioLookup {
  readonly ownerEmail: string;
  readonly portfolioSlug: string;
}

interface TranslationPublication extends OwnedPortfolioLookup {
  readonly document: object;
  readonly locale: string;
}

function requireDatabaseUrl(): string {
  const databaseUrl = process.env['DATABASE_URL'];
  if (databaseUrl === undefined) throw new Error('DATABASE_URL is required for E2E support');
  return databaseUrl;
}

export function readOwnedPublishedDocument(input: OwnedPortfolioLookup): Promise<unknown> {
  return readOwnedPublishedDocumentFromDatabase({ ...input, databaseUrl: requireDatabaseUrl() });
}

export function publishOwnedTranslationSnapshotForTest(
  input: TranslationPublication,
): Promise<void> {
  return publishOwnedTranslationSnapshotForTestInDatabase({
    ...input,
    databaseUrl: requireDatabaseUrl(),
  });
}
