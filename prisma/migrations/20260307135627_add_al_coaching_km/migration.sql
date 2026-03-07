-- CreateTable
CREATE TABLE "ActionLearningTeam" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamName" TEXT NOT NULL DEFAULT '',
    "topic" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "members" TEXT NOT NULL DEFAULT '',
    "mentor" TEXT NOT NULL DEFAULT '',
    "phase" TEXT NOT NULL DEFAULT '组建',
    "startDate" TEXT NOT NULL DEFAULT '',
    "endDate" TEXT NOT NULL DEFAULT '',
    "milestone1" TEXT NOT NULL DEFAULT '',
    "milestone1Date" TEXT NOT NULL DEFAULT '',
    "milestone1Status" TEXT NOT NULL DEFAULT 'pending',
    "milestone2" TEXT NOT NULL DEFAULT '',
    "milestone2Date" TEXT NOT NULL DEFAULT '',
    "milestone2Status" TEXT NOT NULL DEFAULT 'pending',
    "milestone3" TEXT NOT NULL DEFAULT '',
    "milestone3Date" TEXT NOT NULL DEFAULT '',
    "milestone3Status" TEXT NOT NULL DEFAULT 'pending',
    "deliverable" TEXT NOT NULL DEFAULT '',
    "progressLog" TEXT NOT NULL DEFAULT '',
    "score" TEXT NOT NULL DEFAULT '',
    "feedback" TEXT NOT NULL DEFAULT '',
    "projectId" TEXT NOT NULL,
    CONSTRAINT "ActionLearningTeam_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CoachingEngagement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "coacheeName" TEXT NOT NULL DEFAULT '',
    "coachName" TEXT NOT NULL DEFAULT '',
    "coachType" TEXT NOT NULL DEFAULT '',
    "goal" TEXT NOT NULL DEFAULT '',
    "goalSmart" TEXT NOT NULL DEFAULT '',
    "phase" TEXT NOT NULL DEFAULT '匹配',
    "sessionsPlanned" INTEGER NOT NULL DEFAULT 6,
    "sessionsCompleted" INTEGER NOT NULL DEFAULT 0,
    "sessionLog" TEXT NOT NULL DEFAULT '[]',
    "startDate" TEXT NOT NULL DEFAULT '',
    "endDate" TEXT NOT NULL DEFAULT '',
    "preScore" TEXT NOT NULL DEFAULT '',
    "postScore" TEXT NOT NULL DEFAULT '',
    "outcome" TEXT NOT NULL DEFAULT '',
    "coacheeReflection" TEXT NOT NULL DEFAULT '',
    "managerFeedback" TEXT NOT NULL DEFAULT '',
    "projectId" TEXT NOT NULL,
    CONSTRAINT "CoachingEngagement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KnowledgeFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stepKey" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "fileType" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "fileName" TEXT NOT NULL DEFAULT '',
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "filePath" TEXT NOT NULL DEFAULT '',
    "uploadedBy" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "KnowledgeFile_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
