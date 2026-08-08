import process from 'node:process';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

import { createEmptyPortfolioDocument } from '@/modules/portfolio-document';

import { SEED_DOCUMENT, SEED_OWNER, SEED_SLUG } from './seed-fixture.mts';

/**
 * Development seed.
 *
 * Publishes one complete portfolio so a developer can open `/{slug}` on a fresh
 * database and see the real renderer with real data, rather than an empty
 * dashboard. It is idempotent: re-running updates the same rows.
 *
 * The fixture is synthetic. No real person's CV belongs in a repository, and a
 * seed that quietly becomes one is how it happens.
 */

const connectionString = process.env['DATABASE_URL'];

if (!connectionString) {
  throw new Error('DATABASE_URL must be set to seed.');
}

const database = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function seed(): Promise<void> {
  const user = await database.user.upsert({
    where: { email: SEED_OWNER.email },
    update: { name: SEED_OWNER.name },
    create: {
      id: SEED_OWNER.id,
      email: SEED_OWNER.email,
      name: SEED_OWNER.name,
      emailVerified: true,
    },
  });

  const publishedAt = new Date();
  const draft = SEED_DOCUMENT;

  await database.portfolio.upsert({
    where: { slug: SEED_SLUG },
    update: {
      draftDocument: draft,
      publishedDocument: draft,
      status: 'PUBLISHED',
      publishedAt,
    },
    create: {
      ownerId: user.id,
      slug: SEED_SLUG,
      status: 'PUBLISHED',
      templateId: draft.theme.templateId,
      draftDocument: draft,
      publishedDocument: draft,
      publishedVersion: 1,
      publishedAt,
    },
  });

  // A second, deliberately sparse portfolio: the renderer has to look right
  // for a CV with no projects, no education and no photo, and the only way to
  // keep noticing that is to have one in front of us.
  const minimal = createEmptyPortfolioDocument('Minimal Example');

  await database.portfolio.upsert({
    where: { slug: 'minimal-example' },
    update: { draftDocument: minimal },
    create: {
      ownerId: user.id,
      slug: 'minimal-example',
      status: 'DRAFT',
      templateId: minimal.theme.templateId,
      draftDocument: minimal,
    },
  });
}

await seed();
await database.$disconnect();
