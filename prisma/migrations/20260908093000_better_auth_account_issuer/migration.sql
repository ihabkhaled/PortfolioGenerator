-- better-auth 1.7 scopes account identity by issuer and sends the column on
-- every account create, so without it sign-up fails at `account.create` and
-- the account is never written.
--
-- Backfilled as "local:" || "providerId", which is exactly what better-auth's
-- createLocalAccountIssuer() produces for a locally issued account. This
-- deployment configures no social providers, so every existing row is a
-- password account and becomes "local:credential".

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN "issuer" TEXT;
UPDATE "accounts" SET "issuer" = 'local:' || "providerId" WHERE "issuer" IS NULL;
ALTER TABLE "accounts" ALTER COLUMN "issuer" SET NOT NULL;

-- AlterTable
ALTER TABLE "admin_accounts" ADD COLUMN "issuer" TEXT;
UPDATE "admin_accounts" SET "issuer" = 'local:' || "providerId" WHERE "issuer" IS NULL;
ALTER TABLE "admin_accounts" ALTER COLUMN "issuer" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "accounts_issuer_accountId_key" ON "accounts"("issuer", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_accounts_issuer_accountId_key" ON "admin_accounts"("issuer", "accountId");
