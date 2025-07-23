-- CreateTable
CREATE TABLE "agent_conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "agent_type" TEXT NOT NULL DEFAULT 'pinescript',
    "context" JSONB NOT NULL DEFAULT {},
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "agent_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "agent_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversation_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB DEFAULT {},
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "agent_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "agent_conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "generated_pine_code" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "pine_script_code" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "validation_status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB DEFAULT {},
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "generated_pine_code_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "agent_conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "generated_pine_code_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "agent_conversations_session_id_key" ON "agent_conversations"("session_id");

-- CreateIndex
CREATE INDEX "agent_conversations_user_id_idx" ON "agent_conversations"("user_id");

-- CreateIndex
CREATE INDEX "agent_conversations_session_id_idx" ON "agent_conversations"("session_id");

-- CreateIndex
CREATE INDEX "agent_conversations_agent_type_idx" ON "agent_conversations"("agent_type");

-- CreateIndex
CREATE INDEX "agent_conversations_created_at_idx" ON "agent_conversations"("created_at");

-- CreateIndex
CREATE INDEX "agent_conversations_user_id_agent_type_idx" ON "agent_conversations"("user_id", "agent_type");

-- CreateIndex
CREATE INDEX "agent_conversations_user_id_created_at_idx" ON "agent_conversations"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "agent_messages_conversation_id_idx" ON "agent_messages"("conversation_id");

-- CreateIndex
CREATE INDEX "agent_messages_role_idx" ON "agent_messages"("role");

-- CreateIndex
CREATE INDEX "agent_messages_created_at_idx" ON "agent_messages"("created_at");

-- CreateIndex
CREATE INDEX "agent_messages_conversation_id_created_at_idx" ON "agent_messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "generated_pine_code_conversation_id_idx" ON "generated_pine_code"("conversation_id");

-- CreateIndex
CREATE INDEX "generated_pine_code_user_id_idx" ON "generated_pine_code"("user_id");

-- CreateIndex
CREATE INDEX "generated_pine_code_validation_status_idx" ON "generated_pine_code"("validation_status");

-- CreateIndex
CREATE INDEX "generated_pine_code_created_at_idx" ON "generated_pine_code"("created_at");

-- CreateIndex
CREATE INDEX "generated_pine_code_conversation_id_version_idx" ON "generated_pine_code"("conversation_id", "version");

-- CreateIndex
CREATE INDEX "generated_pine_code_user_id_created_at_idx" ON "generated_pine_code"("user_id", "created_at");
