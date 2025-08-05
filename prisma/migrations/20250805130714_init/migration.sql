-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."ScriptType" AS ENUM ('INDICATOR', 'STRATEGY', 'LIBRARY');

-- CreateEnum
CREATE TYPE "public"."ScriptStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."Permission" AS ENUM ('READ', 'WRITE', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."AgentMessageRole" AS ENUM ('USER', 'AGENT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'UNPAID', 'TRIALING', 'INCOMPLETE', 'INCOMPLETE_EXPIRED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'APPROVED', 'DECLINED', 'ERROR', 'EXPIRED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "email_verified" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "image" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."llm_models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "maxTokens" INTEGER,
    "costPer1kTokens" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "llm_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."conversations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "title" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "role" "public"."MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT true,
    "password_hash" TEXT NOT NULL,
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "mfa_secret" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "last_login_ip" TEXT,
    "session_id" TEXT,
    "login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resource_id" TEXT,
    "details" JSONB,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_metrics" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cpu_usage" DOUBLE PRECISION NOT NULL,
    "memory_usage" DOUBLE PRECISION NOT NULL,
    "disk_usage" DOUBLE PRECISION NOT NULL,
    "active_users" INTEGER NOT NULL,
    "api_requests" INTEGER NOT NULL,
    "error_rate" DOUBLE PRECISION NOT NULL,
    "response_time" DOUBLE PRECISION NOT NULL,
    "db_connections" INTEGER NOT NULL,
    "queue_size" INTEGER NOT NULL,

    CONSTRAINT "system_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "is_system_setting" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "admin_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_activity" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "details" JSONB,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."security_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "resolved_by" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."scripts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "pine_code" TEXT,
    "type" "public"."ScriptType" NOT NULL DEFAULT 'INDICATOR',
    "status" "public"."ScriptStatus" NOT NULL DEFAULT 'DRAFT',
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."strategies" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "nodes" JSONB NOT NULL,
    "connections" JSONB NOT NULL,
    "pine_script_code" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "folder_id" TEXT,
    "template_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strategies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."strategy_versions" (
    "id" TEXT NOT NULL,
    "strategy_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "nodes" JSONB NOT NULL,
    "connections" JSONB NOT NULL,
    "pine_script_code" TEXT,
    "change_log" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "strategy_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."strategy_folders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parent_id" TEXT,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strategy_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."strategy_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "nodes" JSONB NOT NULL,
    "connections" JSONB NOT NULL,
    "tags" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'beginner',
    "is_official" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strategy_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."backtest_results" (
    "id" TEXT NOT NULL,
    "strategy_id" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "results" JSONB NOT NULL,
    "performance_metrics" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "backtest_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shared_strategies" (
    "id" TEXT NOT NULL,
    "strategy_id" TEXT NOT NULL,
    "shared_by" TEXT NOT NULL,
    "shared_with" TEXT,
    "permission" "public"."Permission" NOT NULL DEFAULT 'READ',
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_strategies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."agent_conversations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "agent_type" TEXT NOT NULL DEFAULT 'pinescript',
    "context" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."agent_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "role" "public"."AgentMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."generated_pine_code" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "pine_script_code" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "validation_status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_pine_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."api_keys" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "key_name" TEXT NOT NULL,
    "encrypted_key" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_used" TIMESTAMP(3),
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "monthly_price" DECIMAL(10,2) NOT NULL,
    "annual_price" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "features" JSONB NOT NULL,
    "limits" JSONB NOT NULL,
    "is_popular" BOOLEAN NOT NULL DEFAULT false,
    "trial_days" INTEGER NOT NULL DEFAULT 0,
    "payu_plan_id" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "trial_end" TIMESTAMP(3),
    "payu_subscription_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subscription_id" TEXT,
    "payu_transaction_id" VARCHAR(100),
    "reference_code" VARCHAR(100) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_method" VARCHAR(50),
    "description" TEXT,
    "customer_info" JSONB,
    "payu_response" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invoices" (
    "id" TEXT NOT NULL,
    "invoice_number" VARCHAR(50) NOT NULL,
    "user_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "status" "public"."InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "due_date" TIMESTAMP(3),
    "items" JSONB NOT NULL,
    "billing_address" JSONB,
    "pdf_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."webhook_events" (
    "id" TEXT NOT NULL,
    "event_type" VARCHAR(50) NOT NULL,
    "payu_transaction_id" VARCHAR(100),
    "payload" JSONB NOT NULL,
    "signature" VARCHAR(255),
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processing_result" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usage_metrics" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "metric_type" TEXT NOT NULL,
    "metric_value" INTEGER NOT NULL DEFAULT 1,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "public"."accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "public"."sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "public"."verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "public"."verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "llm_models_name_key" ON "public"."llm_models"("name");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "public"."admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_isAdmin_key" ON "public"."admin_users"("isAdmin");

-- CreateIndex
CREATE INDEX "audit_logs_admin_id_idx" ON "public"."audit_logs"("admin_id");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "public"."audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "public"."audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_resource_idx" ON "public"."audit_logs"("resource");

-- CreateIndex
CREATE INDEX "system_metrics_timestamp_idx" ON "public"."system_metrics"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "admin_settings_key_key" ON "public"."admin_settings"("key");

-- CreateIndex
CREATE INDEX "admin_settings_category_idx" ON "public"."admin_settings"("category");

-- CreateIndex
CREATE INDEX "user_activity_user_id_idx" ON "public"."user_activity"("user_id");

-- CreateIndex
CREATE INDEX "user_activity_timestamp_idx" ON "public"."user_activity"("timestamp");

-- CreateIndex
CREATE INDEX "user_activity_action_idx" ON "public"."user_activity"("action");

-- CreateIndex
CREATE INDEX "security_events_type_idx" ON "public"."security_events"("type");

-- CreateIndex
CREATE INDEX "security_events_severity_idx" ON "public"."security_events"("severity");

-- CreateIndex
CREATE INDEX "security_events_timestamp_idx" ON "public"."security_events"("timestamp");

-- CreateIndex
CREATE INDEX "security_events_resolved_idx" ON "public"."security_events"("resolved");

-- CreateIndex
CREATE INDEX "scripts_user_id_idx" ON "public"."scripts"("user_id");

-- CreateIndex
CREATE INDEX "scripts_type_idx" ON "public"."scripts"("type");

-- CreateIndex
CREATE INDEX "scripts_status_idx" ON "public"."scripts"("status");

-- CreateIndex
CREATE INDEX "scripts_is_public_idx" ON "public"."scripts"("is_public");

-- CreateIndex
CREATE INDEX "scripts_created_at_idx" ON "public"."scripts"("created_at");

-- CreateIndex
CREATE INDEX "strategies_user_id_idx" ON "public"."strategies"("user_id");

-- CreateIndex
CREATE INDEX "strategies_category_idx" ON "public"."strategies"("category");

-- CreateIndex
CREATE INDEX "strategies_is_public_idx" ON "public"."strategies"("is_public");

-- CreateIndex
CREATE INDEX "strategies_created_at_idx" ON "public"."strategies"("created_at");

-- CreateIndex
CREATE INDEX "strategies_folder_id_idx" ON "public"."strategies"("folder_id");

-- CreateIndex
CREATE INDEX "strategies_template_id_idx" ON "public"."strategies"("template_id");

-- CreateIndex
CREATE INDEX "strategies_user_id_category_idx" ON "public"."strategies"("user_id", "category");

-- CreateIndex
CREATE INDEX "strategies_user_id_is_public_idx" ON "public"."strategies"("user_id", "is_public");

-- CreateIndex
CREATE INDEX "strategies_user_id_created_at_idx" ON "public"."strategies"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "strategies_user_id_folder_id_idx" ON "public"."strategies"("user_id", "folder_id");

-- CreateIndex
CREATE INDEX "strategy_versions_strategy_id_idx" ON "public"."strategy_versions"("strategy_id");

-- CreateIndex
CREATE INDEX "strategy_versions_created_at_idx" ON "public"."strategy_versions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "strategy_versions_strategy_id_version_key" ON "public"."strategy_versions"("strategy_id", "version");

-- CreateIndex
CREATE INDEX "strategy_folders_user_id_idx" ON "public"."strategy_folders"("user_id");

-- CreateIndex
CREATE INDEX "strategy_folders_parent_id_idx" ON "public"."strategy_folders"("parent_id");

-- CreateIndex
CREATE INDEX "strategy_folders_user_id_parent_id_idx" ON "public"."strategy_folders"("user_id", "parent_id");

-- CreateIndex
CREATE INDEX "strategy_templates_category_idx" ON "public"."strategy_templates"("category");

-- CreateIndex
CREATE INDEX "strategy_templates_difficulty_idx" ON "public"."strategy_templates"("difficulty");

-- CreateIndex
CREATE INDEX "strategy_templates_is_official_idx" ON "public"."strategy_templates"("is_official");

-- CreateIndex
CREATE INDEX "backtest_results_strategy_id_idx" ON "public"."backtest_results"("strategy_id");

-- CreateIndex
CREATE INDEX "backtest_results_status_idx" ON "public"."backtest_results"("status");

-- CreateIndex
CREATE INDEX "backtest_results_started_at_idx" ON "public"."backtest_results"("started_at");

-- CreateIndex
CREATE INDEX "backtest_results_strategy_id_status_idx" ON "public"."backtest_results"("strategy_id", "status");

-- CreateIndex
CREATE INDEX "backtest_results_strategy_id_started_at_idx" ON "public"."backtest_results"("strategy_id", "started_at");

-- CreateIndex
CREATE INDEX "shared_strategies_strategy_id_idx" ON "public"."shared_strategies"("strategy_id");

-- CreateIndex
CREATE INDEX "shared_strategies_shared_by_idx" ON "public"."shared_strategies"("shared_by");

-- CreateIndex
CREATE INDEX "shared_strategies_shared_with_idx" ON "public"."shared_strategies"("shared_with");

-- CreateIndex
CREATE UNIQUE INDEX "shared_strategies_strategy_id_shared_with_key" ON "public"."shared_strategies"("strategy_id", "shared_with");

-- CreateIndex
CREATE UNIQUE INDEX "agent_conversations_session_id_key" ON "public"."agent_conversations"("session_id");

-- CreateIndex
CREATE INDEX "agent_conversations_user_id_idx" ON "public"."agent_conversations"("user_id");

-- CreateIndex
CREATE INDEX "agent_conversations_session_id_idx" ON "public"."agent_conversations"("session_id");

-- CreateIndex
CREATE INDEX "agent_conversations_agent_type_idx" ON "public"."agent_conversations"("agent_type");

-- CreateIndex
CREATE INDEX "agent_conversations_created_at_idx" ON "public"."agent_conversations"("created_at");

-- CreateIndex
CREATE INDEX "agent_conversations_user_id_agent_type_idx" ON "public"."agent_conversations"("user_id", "agent_type");

-- CreateIndex
CREATE INDEX "agent_conversations_user_id_created_at_idx" ON "public"."agent_conversations"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "agent_messages_conversation_id_idx" ON "public"."agent_messages"("conversation_id");

-- CreateIndex
CREATE INDEX "agent_messages_role_idx" ON "public"."agent_messages"("role");

-- CreateIndex
CREATE INDEX "agent_messages_created_at_idx" ON "public"."agent_messages"("created_at");

-- CreateIndex
CREATE INDEX "agent_messages_conversation_id_created_at_idx" ON "public"."agent_messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "generated_pine_code_conversation_id_idx" ON "public"."generated_pine_code"("conversation_id");

-- CreateIndex
CREATE INDEX "generated_pine_code_user_id_idx" ON "public"."generated_pine_code"("user_id");

-- CreateIndex
CREATE INDEX "generated_pine_code_validation_status_idx" ON "public"."generated_pine_code"("validation_status");

-- CreateIndex
CREATE INDEX "generated_pine_code_created_at_idx" ON "public"."generated_pine_code"("created_at");

-- CreateIndex
CREATE INDEX "generated_pine_code_conversation_id_version_idx" ON "public"."generated_pine_code"("conversation_id", "version");

-- CreateIndex
CREATE INDEX "generated_pine_code_user_id_created_at_idx" ON "public"."generated_pine_code"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_provider_key" ON "public"."api_keys"("provider");

-- CreateIndex
CREATE INDEX "api_keys_provider_idx" ON "public"."api_keys"("provider");

-- CreateIndex
CREATE INDEX "api_keys_is_active_idx" ON "public"."api_keys"("is_active");

-- CreateIndex
CREATE INDEX "api_keys_created_at_idx" ON "public"."api_keys"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_name_key" ON "public"."subscription_plans"("name");

-- CreateIndex
CREATE INDEX "subscription_plans_name_idx" ON "public"."subscription_plans"("name");

-- CreateIndex
CREATE INDEX "subscription_plans_is_active_idx" ON "public"."subscription_plans"("is_active");

-- CreateIndex
CREATE INDEX "subscriptions_user_id_idx" ON "public"."subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "public"."subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_plan_id_idx" ON "public"."subscriptions"("plan_id");

-- CreateIndex
CREATE INDEX "subscriptions_current_period_end_idx" ON "public"."subscriptions"("current_period_end");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_status_key" ON "public"."subscriptions"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_payu_transaction_id_key" ON "public"."payments"("payu_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_reference_code_key" ON "public"."payments"("reference_code");

-- CreateIndex
CREATE INDEX "payments_user_id_idx" ON "public"."payments"("user_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "public"."payments"("status");

-- CreateIndex
CREATE INDEX "payments_payu_transaction_id_idx" ON "public"."payments"("payu_transaction_id");

-- CreateIndex
CREATE INDEX "payments_reference_code_idx" ON "public"."payments"("reference_code");

-- CreateIndex
CREATE INDEX "payments_subscription_id_idx" ON "public"."payments"("subscription_id");

-- CreateIndex
CREATE INDEX "payments_created_at_idx" ON "public"."payments"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "public"."invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_user_id_idx" ON "public"."invoices"("user_id");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "public"."invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_invoice_number_idx" ON "public"."invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_payment_id_idx" ON "public"."invoices"("payment_id");

-- CreateIndex
CREATE INDEX "invoices_created_at_idx" ON "public"."invoices"("created_at");

-- CreateIndex
CREATE INDEX "webhook_events_processed_idx" ON "public"."webhook_events"("processed");

-- CreateIndex
CREATE INDEX "webhook_events_event_type_idx" ON "public"."webhook_events"("event_type");

-- CreateIndex
CREATE INDEX "webhook_events_payu_transaction_id_idx" ON "public"."webhook_events"("payu_transaction_id");

-- CreateIndex
CREATE INDEX "webhook_events_created_at_idx" ON "public"."webhook_events"("created_at");

-- CreateIndex
CREATE INDEX "usage_metrics_user_id_idx" ON "public"."usage_metrics"("user_id");

-- CreateIndex
CREATE INDEX "usage_metrics_subscription_id_idx" ON "public"."usage_metrics"("subscription_id");

-- CreateIndex
CREATE INDEX "usage_metrics_metric_type_idx" ON "public"."usage_metrics"("metric_type");

-- CreateIndex
CREATE INDEX "usage_metrics_period_start_period_end_idx" ON "public"."usage_metrics"("period_start", "period_end");

-- CreateIndex
CREATE UNIQUE INDEX "usage_metrics_user_id_metric_type_period_start_period_end_key" ON "public"."usage_metrics"("user_id", "metric_type", "period_start", "period_end");

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."llm_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_activity" ADD CONSTRAINT "user_activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scripts" ADD CONSTRAINT "scripts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."strategies" ADD CONSTRAINT "strategies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."strategies" ADD CONSTRAINT "strategies_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "public"."strategy_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."strategies" ADD CONSTRAINT "strategies_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."strategy_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."strategy_versions" ADD CONSTRAINT "strategy_versions_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."strategy_folders" ADD CONSTRAINT "strategy_folders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."strategy_folders" ADD CONSTRAINT "strategy_folders_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."strategy_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."backtest_results" ADD CONSTRAINT "backtest_results_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shared_strategies" ADD CONSTRAINT "shared_strategies_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shared_strategies" ADD CONSTRAINT "shared_strategies_shared_by_fkey" FOREIGN KEY ("shared_by") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shared_strategies" ADD CONSTRAINT "shared_strategies_shared_with_fkey" FOREIGN KEY ("shared_with") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."agent_conversations" ADD CONSTRAINT "agent_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."agent_messages" ADD CONSTRAINT "agent_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."agent_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."generated_pine_code" ADD CONSTRAINT "generated_pine_code_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."agent_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."generated_pine_code" ADD CONSTRAINT "generated_pine_code_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usage_metrics" ADD CONSTRAINT "usage_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usage_metrics" ADD CONSTRAINT "usage_metrics_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
