-- CreateIndex
CREATE INDEX "backtest_results_strategy_id_status_idx" ON "backtest_results"("strategy_id", "status");

-- CreateIndex
CREATE INDEX "backtest_results_strategy_id_started_at_idx" ON "backtest_results"("strategy_id", "started_at");

-- CreateIndex
CREATE INDEX "strategies_user_id_category_idx" ON "strategies"("user_id", "category");

-- CreateIndex
CREATE INDEX "strategies_user_id_is_public_idx" ON "strategies"("user_id", "is_public");

-- CreateIndex
CREATE INDEX "strategies_user_id_created_at_idx" ON "strategies"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "strategies_user_id_folder_id_idx" ON "strategies"("user_id", "folder_id");

-- CreateIndex
CREATE INDEX "strategy_folders_user_id_parent_id_idx" ON "strategy_folders"("user_id", "parent_id");
