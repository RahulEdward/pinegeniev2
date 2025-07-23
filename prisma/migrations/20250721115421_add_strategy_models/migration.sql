-- CreateTable
CREATE TABLE "scripts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "pine_code" TEXT,
    "type" TEXT NOT NULL DEFAULT 'INDICATOR',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "scripts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "strategies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "nodes" JSONB NOT NULL DEFAULT [],
    "connections" JSONB NOT NULL DEFAULT [],
    "pine_script_code" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "folder_id" TEXT,
    "template_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "strategies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "strategies_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "strategy_folders" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "strategies_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "strategy_templates" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "strategy_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "strategy_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "nodes" JSONB NOT NULL DEFAULT [],
    "connections" JSONB NOT NULL DEFAULT [],
    "pine_script_code" TEXT,
    "change_log" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "strategy_versions_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "strategies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "strategy_folders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parent_id" TEXT,
    "color" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "strategy_folders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "strategy_folders_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "strategy_folders" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "strategy_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "nodes" JSONB NOT NULL DEFAULT [],
    "connections" JSONB NOT NULL DEFAULT [],
    "tags" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'beginner',
    "is_official" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "backtest_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "strategy_id" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "results" JSONB NOT NULL,
    "performance_metrics" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" DATETIME,
    CONSTRAINT "backtest_results_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "strategies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "shared_strategies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "strategy_id" TEXT NOT NULL,
    "shared_by" TEXT NOT NULL,
    "shared_with" TEXT,
    "permission" TEXT NOT NULL DEFAULT 'READ',
    "expires_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shared_strategies_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "strategies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "shared_strategies_shared_by_fkey" FOREIGN KEY ("shared_by") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "shared_strategies_shared_with_fkey" FOREIGN KEY ("shared_with") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "scripts_user_id_idx" ON "scripts"("user_id");

-- CreateIndex
CREATE INDEX "scripts_type_idx" ON "scripts"("type");

-- CreateIndex
CREATE INDEX "scripts_status_idx" ON "scripts"("status");

-- CreateIndex
CREATE INDEX "scripts_is_public_idx" ON "scripts"("is_public");

-- CreateIndex
CREATE INDEX "scripts_created_at_idx" ON "scripts"("created_at");

-- CreateIndex
CREATE INDEX "strategies_user_id_idx" ON "strategies"("user_id");

-- CreateIndex
CREATE INDEX "strategies_category_idx" ON "strategies"("category");

-- CreateIndex
CREATE INDEX "strategies_is_public_idx" ON "strategies"("is_public");

-- CreateIndex
CREATE INDEX "strategies_created_at_idx" ON "strategies"("created_at");

-- CreateIndex
CREATE INDEX "strategies_folder_id_idx" ON "strategies"("folder_id");

-- CreateIndex
CREATE INDEX "strategies_template_id_idx" ON "strategies"("template_id");

-- CreateIndex
CREATE INDEX "strategy_versions_strategy_id_idx" ON "strategy_versions"("strategy_id");

-- CreateIndex
CREATE INDEX "strategy_versions_created_at_idx" ON "strategy_versions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "strategy_versions_strategy_id_version_key" ON "strategy_versions"("strategy_id", "version");

-- CreateIndex
CREATE INDEX "strategy_folders_user_id_idx" ON "strategy_folders"("user_id");

-- CreateIndex
CREATE INDEX "strategy_folders_parent_id_idx" ON "strategy_folders"("parent_id");

-- CreateIndex
CREATE INDEX "strategy_templates_category_idx" ON "strategy_templates"("category");

-- CreateIndex
CREATE INDEX "strategy_templates_difficulty_idx" ON "strategy_templates"("difficulty");

-- CreateIndex
CREATE INDEX "strategy_templates_is_official_idx" ON "strategy_templates"("is_official");

-- CreateIndex
CREATE INDEX "backtest_results_strategy_id_idx" ON "backtest_results"("strategy_id");

-- CreateIndex
CREATE INDEX "backtest_results_status_idx" ON "backtest_results"("status");

-- CreateIndex
CREATE INDEX "backtest_results_started_at_idx" ON "backtest_results"("started_at");

-- CreateIndex
CREATE INDEX "shared_strategies_strategy_id_idx" ON "shared_strategies"("strategy_id");

-- CreateIndex
CREATE INDEX "shared_strategies_shared_by_idx" ON "shared_strategies"("shared_by");

-- CreateIndex
CREATE INDEX "shared_strategies_shared_with_idx" ON "shared_strategies"("shared_with");

-- CreateIndex
CREATE UNIQUE INDEX "shared_strategies_strategy_id_shared_with_key" ON "shared_strategies"("strategy_id", "shared_with");
