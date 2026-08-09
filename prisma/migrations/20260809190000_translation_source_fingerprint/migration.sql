ALTER TABLE "portfolio_translations"
ADD COLUMN "source_fingerprint" TEXT NOT NULL DEFAULT '';

ALTER TABLE "portfolio_translations"
ALTER COLUMN "source_fingerprint" DROP DEFAULT;
