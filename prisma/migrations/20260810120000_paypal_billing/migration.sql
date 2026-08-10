-- CreateEnum
CREATE TYPE "subscription_status" AS ENUM ('NONE', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "paypal_payer_id" TEXT,
ADD COLUMN     "paypal_subscription_id" TEXT,
ADD COLUMN     "subscription_status" "subscription_status" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "subscription_updated_at" TIMESTAMP(3),
ADD COLUMN     "trial_ends_at" TIMESTAMP(3),
ADD COLUMN     "trial_started_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "paypal_billing_plans" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paypal_billing_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paypal_webhook_events" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paypal_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "paypal_billing_plans_key_key" ON "paypal_billing_plans"("key");

-- CreateIndex
CREATE UNIQUE INDEX "paypal_webhook_events_event_id_key" ON "paypal_webhook_events"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_paypal_subscription_id_key" ON "users"("paypal_subscription_id");

-- CreateIndex
CREATE INDEX "users_subscription_status_trial_ends_at_idx" ON "users"("subscription_status", "trial_ends_at");
