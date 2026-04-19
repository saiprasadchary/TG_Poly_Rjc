-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "durationMin" INTEGER,
    "totalMarks" INTEGER,
    "totalQuestions" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ExamGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "ExamGroup_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examId" TEXT NOT NULL,
    "groupId" TEXT,
    "name" TEXT NOT NULL,
    "marks" INTEGER,
    "weight" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "Subject_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Subject_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ExamGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Paper" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examId" TEXT NOT NULL,
    "groupId" TEXT,
    "sourceRecordId" TEXT,
    "year" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceUrl" TEXT,
    CONSTRAINT "Paper_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Paper_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ExamGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Paper_sourceRecordId_fkey" FOREIGN KEY ("sourceRecordId") REFERENCES "SourceRecord" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examId" TEXT NOT NULL,
    "groupId" TEXT,
    "paperId" TEXT,
    "sourceRecordId" TEXT,
    "subjectId" TEXT NOT NULL,
    "year" INTEGER,
    "topic" TEXT NOT NULL,
    "subtopic" TEXT,
    "difficulty" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceUrl" TEXT,
    CONSTRAINT "Question_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Question_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ExamGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Question_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Question_sourceRecordId_fkey" FOREIGN KEY ("sourceRecordId") REFERENCES "SourceRecord" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Question_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Option" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnswerKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "sourceRecordId" TEXT,
    "correctOption" TEXT NOT NULL,
    "verificationStatus" TEXT NOT NULL DEFAULT 'demo_unverified',
    CONSTRAINT "AnswerKey_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AnswerKey_sourceRecordId_fkey" FOREIGN KEY ("sourceRecordId") REFERENCES "SourceRecord" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TopicTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "sourceRecordId" TEXT,
    "tag" TEXT NOT NULL,
    CONSTRAINT "TopicTag_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TopicTag_sourceRecordId_fkey" FOREIGN KEY ("sourceRecordId") REFERENCES "SourceRecord" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SourceRecord" (
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
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "targetExam" TEXT NOT NULL,
    "targetGroup" TEXT,
    "phoneStudyMode" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MockAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "groupId" TEXT,
    "subjectId" TEXT,
    "mode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "totalMarks" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "accuracy" REAL NOT NULL DEFAULT 0,
    "timeSpentSec" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MockAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MockAttempt_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MockAttempt_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ExamGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MockAttempt_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MockAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOption" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "isGuessed" BOOLEAN NOT NULL DEFAULT false,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "timeSpentSec" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "MockAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "MockAttempt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MockAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudyPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "examType" TEXT NOT NULL,
    "groupCode" TEXT,
    "durationDays" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "planJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeaknessProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "examType" TEXT NOT NULL,
    "groupCode" TEXT,
    "subject" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "avgTimeSec" INTEGER NOT NULL DEFAULT 0,
    "confidence" REAL NOT NULL DEFAULT 0,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WeaknessProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Bookmark_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Exam_code_key" ON "Exam"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ExamGroup_examId_code_key" ON "ExamGroup"("examId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_examId_groupId_name_key" ON "Subject"("examId", "groupId", "name");

-- CreateIndex
CREATE INDEX "Paper_year_idx" ON "Paper"("year");

-- CreateIndex
CREATE INDEX "Paper_sourceRecordId_idx" ON "Paper"("sourceRecordId");

-- CreateIndex
CREATE INDEX "Question_topic_idx" ON "Question"("topic");

-- CreateIndex
CREATE INDEX "Question_year_idx" ON "Question"("year");

-- CreateIndex
CREATE INDEX "Question_sourceRecordId_idx" ON "Question"("sourceRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "Option_questionId_label_key" ON "Option"("questionId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "AnswerKey_questionId_key" ON "AnswerKey"("questionId");

-- CreateIndex
CREATE INDEX "TopicTag_sourceRecordId_idx" ON "TopicTag"("sourceRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "TopicTag_questionId_tag_key" ON "TopicTag"("questionId", "tag");

-- CreateIndex
CREATE INDEX "SourceRecord_exam_group_assetType_idx" ON "SourceRecord"("exam", "group", "assetType");

-- CreateIndex
CREATE INDEX "SourceRecord_sourceType_tier_idx" ON "SourceRecord"("sourceType", "tier");

-- CreateIndex
CREATE INDEX "SourceRecord_verificationStatus_idx" ON "SourceRecord"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "MockAnswer_attemptId_questionId_key" ON "MockAnswer"("attemptId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "WeaknessProfile_userId_examType_groupCode_subject_topic_key" ON "WeaknessProfile"("userId", "examType", "groupCode", "subject", "topic");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_questionId_type_key" ON "Bookmark"("userId", "questionId", "type");

