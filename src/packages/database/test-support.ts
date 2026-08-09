import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

interface OwnedAssetLookup {
  readonly ownerEmail: string;
  readonly assetId: string;
  readonly databaseUrl: string;
}

interface OwnedPublishedDocumentLookup {
  readonly databaseUrl: string;
  readonly ownerEmail: string;
  readonly portfolioSlug: string;
}

interface OwnedTranslationPublication extends OwnedPublishedDocumentLookup {
  readonly document: object;
  readonly locale: string;
}

/** Reads private infrastructure state solely for assertions in the E2E process. */
export async function readOwnedAssetStorageKey(input: OwnedAssetLookup): Promise<string> {
  const database = new PrismaClient({
    adapter: new PrismaPg({ connectionString: input.databaseUrl }),
  });

  try {
    const owner = await database.user.findUnique({
      where: { email: input.ownerEmail },
      select: { id: true },
    });
    if (owner === null) throw new Error('Expected the E2E asset owner to exist');

    const asset = await database.asset.findFirst({
      where: { id: input.assetId, ownerId: owner.id, deletedAt: null },
      select: { storageKey: true },
    });
    if (asset === null) throw new Error('Expected the owner-scoped E2E asset to exist');

    return asset.storageKey;
  } finally {
    await database.$disconnect();
  }
}

/** Reads an owner-scoped published snapshot so an E2E test can validate and translate it. */
export async function readOwnedPublishedDocument(
  input: OwnedPublishedDocumentLookup,
): Promise<unknown> {
  const database = new PrismaClient({
    adapter: new PrismaPg({ connectionString: input.databaseUrl }),
  });

  try {
    const portfolio = await database.portfolio.findFirst({
      where: {
        slug: input.portfolioSlug,
        owner: { email: input.ownerEmail },
        deletedAt: null,
        status: 'PUBLISHED',
      },
      select: { publishedDocument: true },
    });
    const publishedDocument = portfolio?.publishedDocument;
    if (publishedDocument === undefined || publishedDocument === null) {
      throw new Error('Expected the owner-scoped published E2E portfolio to exist');
    }
    return publishedDocument;
  } finally {
    await database.$disconnect();
  }
}

/** Writes a reviewed/published translation fixture behind the same owner and portfolio scope. */
export async function publishOwnedTranslationSnapshotForTest(
  input: OwnedTranslationPublication,
): Promise<void> {
  const database = new PrismaClient({
    adapter: new PrismaPg({ connectionString: input.databaseUrl }),
  });

  try {
    const portfolio = await database.portfolio.findFirst({
      where: {
        slug: input.portfolioSlug,
        owner: { email: input.ownerEmail },
        deletedAt: null,
        status: 'PUBLISHED',
      },
      select: { id: true, ownerId: true },
    });
    if (portfolio === null) {
      throw new Error('Expected the owner-scoped published E2E portfolio to exist');
    }
    const publishedAt = new Date();
    await database.portfolioTranslation.upsert({
      where: { portfolioId_locale: { portfolioId: portfolio.id, locale: input.locale } },
      create: {
        ownerId: portfolio.ownerId,
        portfolioId: portfolio.id,
        locale: input.locale,
        draftDocument: input.document,
        reviewedDocument: input.document,
        reviewedAt: publishedAt,
        publishedDocument: input.document,
        publishedAt,
        publishedVersion: 1,
        sourceFingerprint: 'e2e-reviewed-published-snapshot',
      },
      update: {
        draftDocument: input.document,
        draftVersion: { increment: 1 },
        reviewedDocument: input.document,
        reviewedAt: publishedAt,
        publishedDocument: input.document,
        publishedAt,
        publishedVersion: { increment: 1 },
        sourceFingerprint: 'e2e-reviewed-published-snapshot',
      },
    });
  } finally {
    await database.$disconnect();
  }
}
