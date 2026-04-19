-- Add source-backed registry support to existing Mana Mentor SQLite databases.
CREATE TABLE IF NOT EXISTS "SourceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "exam" TEXT NOT NULL,
    "group" TEXT,
    "assetType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "yearsClaimed" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'unverified',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "SourceRecord_exam_group_assetType_idx" ON "SourceRecord"("exam", "group", "assetType");
CREATE INDEX IF NOT EXISTS "SourceRecord_sourceType_tier_idx" ON "SourceRecord"("sourceType", "tier");
CREATE INDEX IF NOT EXISTS "SourceRecord_verificationStatus_idx" ON "SourceRecord"("verificationStatus");

ALTER TABLE "Paper" ADD COLUMN "sourceRecordId" TEXT;
ALTER TABLE "Question" ADD COLUMN "sourceRecordId" TEXT;
ALTER TABLE "AnswerKey" ADD COLUMN "sourceRecordId" TEXT;
ALTER TABLE "AnswerKey" ADD COLUMN "verificationStatus" TEXT NOT NULL DEFAULT 'demo_unverified';
ALTER TABLE "TopicTag" ADD COLUMN "sourceRecordId" TEXT;

CREATE INDEX IF NOT EXISTS "Paper_sourceRecordId_idx" ON "Paper"("sourceRecordId");
CREATE INDEX IF NOT EXISTS "Question_sourceRecordId_idx" ON "Question"("sourceRecordId");
CREATE INDEX IF NOT EXISTS "TopicTag_sourceRecordId_idx" ON "TopicTag"("sourceRecordId");
