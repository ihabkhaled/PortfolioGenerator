-- CreateEnum
CREATE TYPE "account_status" AS ENUM ('ACTIVE', 'SUSPENDED');

-- AlterTable
ALTER TABLE "portfolios" ADD COLUMN     "suspended_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "status" "account_status" NOT NULL DEFAULT 'ACTIVE';
