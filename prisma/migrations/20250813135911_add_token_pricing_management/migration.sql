-- CreateEnum
CREATE TYPE "public"."PromotionType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_TRIAL', 'UPGRADE_DISCOUNT');

-- CreateTable
CREATE TABLE "public"."token_allocations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_amount" INTEGER NOT NULL,
    "allocated_by" TEXT NOT NULL,
    "reason" TEXT,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."token_usage_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "model_id" TEXT,
    "tokens_used" INTEGER NOT NULL,
    "cost" DECIMAL(10,4) NOT NULL,
    "request_type" TEXT NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."promotions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "public"."PromotionType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "code" TEXT,
    "is_code_required" BOOLEAN NOT NULL DEFAULT true,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "usage_limit" INTEGER,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "eligible_plans" JSONB NOT NULL,
    "eligible_users" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "auto_apply" BOOLEAN NOT NULL DEFAULT false,
    "stackable" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."promotion_usages" (
    "id" TEXT NOT NULL,
    "promotion_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subscription_id" TEXT,
    "payment_id" TEXT,
    "discount_amount" DECIMAL(10,2) NOT NULL,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pricing_content" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "hero_title" TEXT NOT NULL,
    "hero_subtitle" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "benefits" JSONB NOT NULL,
    "testimonials" JSONB NOT NULL,
    "faq" JSONB NOT NULL,
    "call_to_action" JSONB NOT NULL,
    "comparison_table" JSONB,
    "is_draft" BOOLEAN NOT NULL DEFAULT true,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "pricing_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pricing_history" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "old_monthly_price" DECIMAL(10,2) NOT NULL,
    "new_monthly_price" DECIMAL(10,2) NOT NULL,
    "old_annual_price" DECIMAL(10,2) NOT NULL,
    "new_annual_price" DECIMAL(10,2) NOT NULL,
    "change_reason" TEXT NOT NULL,
    "effective_date" TIMESTAMP(3) NOT NULL,
    "affected_users" INTEGER NOT NULL,
    "grandfathered_users" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "pricing_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "token_allocations_user_id_idx" ON "public"."token_allocations"("user_id");

-- CreateIndex
CREATE INDEX "token_allocations_expires_at_idx" ON "public"."token_allocations"("expires_at");

-- CreateIndex
CREATE INDEX "token_allocations_is_active_idx" ON "public"."token_allocations"("is_active");

-- CreateIndex
CREATE INDEX "token_allocations_created_at_idx" ON "public"."token_allocations"("created_at");

-- CreateIndex
CREATE INDEX "token_usage_logs_user_id_idx" ON "public"."token_usage_logs"("user_id");

-- CreateIndex
CREATE INDEX "token_usage_logs_timestamp_idx" ON "public"."token_usage_logs"("timestamp");

-- CreateIndex
CREATE INDEX "token_usage_logs_model_id_idx" ON "public"."token_usage_logs"("model_id");

-- CreateIndex
CREATE INDEX "token_usage_logs_request_type_idx" ON "public"."token_usage_logs"("request_type");

-- CreateIndex
CREATE INDEX "token_usage_logs_user_id_timestamp_idx" ON "public"."token_usage_logs"("user_id", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "promotions_code_key" ON "public"."promotions"("code");

-- CreateIndex
CREATE INDEX "promotions_code_idx" ON "public"."promotions"("code");

-- CreateIndex
CREATE INDEX "promotions_is_active_idx" ON "public"."promotions"("is_active");

-- CreateIndex
CREATE INDEX "promotions_start_date_end_date_idx" ON "public"."promotions"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "promotions_type_idx" ON "public"."promotions"("type");

-- CreateIndex
CREATE INDEX "promotions_created_at_idx" ON "public"."promotions"("created_at");

-- CreateIndex
CREATE INDEX "promotion_usages_promotion_id_idx" ON "public"."promotion_usages"("promotion_id");

-- CreateIndex
CREATE INDEX "promotion_usages_user_id_idx" ON "public"."promotion_usages"("user_id");

-- CreateIndex
CREATE INDEX "promotion_usages_applied_at_idx" ON "public"."promotion_usages"("applied_at");

-- CreateIndex
CREATE INDEX "promotion_usages_subscription_id_idx" ON "public"."promotion_usages"("subscription_id");

-- CreateIndex
CREATE INDEX "promotion_usages_payment_id_idx" ON "public"."promotion_usages"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_content_plan_id_key" ON "public"."pricing_content"("plan_id");

-- CreateIndex
CREATE INDEX "pricing_content_plan_id_idx" ON "public"."pricing_content"("plan_id");

-- CreateIndex
CREATE INDEX "pricing_content_is_draft_idx" ON "public"."pricing_content"("is_draft");

-- CreateIndex
CREATE INDEX "pricing_content_published_at_idx" ON "public"."pricing_content"("published_at");

-- CreateIndex
CREATE INDEX "pricing_content_updated_at_idx" ON "public"."pricing_content"("updated_at");

-- CreateIndex
CREATE INDEX "pricing_history_plan_id_idx" ON "public"."pricing_history"("plan_id");

-- CreateIndex
CREATE INDEX "pricing_history_effective_date_idx" ON "public"."pricing_history"("effective_date");

-- CreateIndex
CREATE INDEX "pricing_history_created_at_idx" ON "public"."pricing_history"("created_at");

-- AddForeignKey
ALTER TABLE "public"."token_allocations" ADD CONSTRAINT "token_allocations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."token_usage_logs" ADD CONSTRAINT "token_usage_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."promotion_usages" ADD CONSTRAINT "promotion_usages_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."promotion_usages" ADD CONSTRAINT "promotion_usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."promotion_usages" ADD CONSTRAINT "promotion_usages_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."promotion_usages" ADD CONSTRAINT "promotion_usages_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pricing_content" ADD CONSTRAINT "pricing_content_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pricing_history" ADD CONSTRAINT "pricing_history_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
