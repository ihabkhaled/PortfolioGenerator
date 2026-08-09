CREATE TABLE "portfolio_translations" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "portfolio_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "draft_document" JSONB NOT NULL,
    "draft_version" INTEGER NOT NULL DEFAULT 1,
    "reviewed_document" JSONB,
    "reviewed_at" TIMESTAMP(3),
    "published_document" JSONB,
    "published_version" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_translations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "portfolio_translations_portfolio_id_locale_key"
ON "portfolio_translations"("portfolio_id", "locale");

CREATE INDEX "portfolio_translations_owner_id_portfolio_id_idx"
ON "portfolio_translations"("owner_id", "portfolio_id");

CREATE INDEX "portfolio_translations_locale_published_at_idx"
ON "portfolio_translations"("locale", "published_at");

ALTER TABLE "portfolio_translations"
ADD CONSTRAINT "portfolio_translations_owner_id_fkey"
FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "portfolio_translations"
ADD CONSTRAINT "portfolio_translations_portfolio_id_fkey"
FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
