-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CurriculumModule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "topic" TEXT NOT NULL DEFAULT '',
    "objective" TEXT NOT NULL DEFAULT '',
    "outline" TEXT NOT NULL DEFAULT '',
    "method" TEXT NOT NULL DEFAULT '',
    "format" TEXT NOT NULL DEFAULT '',
    "hours" REAL NOT NULL DEFAULT 0,
    "facilitatorType" TEXT NOT NULL DEFAULT '',
    "competency" TEXT NOT NULL DEFAULT '',
    "businessAlign" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "CurriculumModule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CurriculumModule" ("businessAlign", "code", "competency", "facilitatorType", "format", "hours", "id", "method", "name", "objective", "projectId", "sortOrder", "topic") SELECT "businessAlign", "code", "competency", "facilitatorType", "format", "hours", "id", "method", "name", "objective", "projectId", "sortOrder", "topic" FROM "CurriculumModule";
DROP TABLE "CurriculumModule";
ALTER TABLE "new_CurriculumModule" RENAME TO "CurriculumModule";
CREATE TABLE "new_JourneyPhase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phase" TEXT NOT NULL DEFAULT '',
    "startDate" TEXT NOT NULL DEFAULT '',
    "duration" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "activities" TEXT NOT NULL DEFAULT '',
    "emotion" TEXT NOT NULL DEFAULT '',
    "intervention" TEXT NOT NULL DEFAULT '',
    "responsible" TEXT NOT NULL DEFAULT '',
    "criteria" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "JourneyPhase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_JourneyPhase" ("activities", "criteria", "description", "duration", "emotion", "id", "intervention", "phase", "projectId", "responsible", "sortOrder") SELECT "activities", "criteria", "description", "duration", "emotion", "id", "intervention", "phase", "projectId", "responsible", "sortOrder" FROM "JourneyPhase";
DROP TABLE "JourneyPhase";
ALTER TABLE "new_JourneyPhase" RENAME TO "JourneyPhase";
CREATE TABLE "new_LearnerPersona" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT '',
    "age" TEXT NOT NULL DEFAULT '',
    "department" TEXT NOT NULL DEFAULT '',
    "position" TEXT NOT NULL DEFAULT '',
    "yearsExp" TEXT NOT NULL DEFAULT '',
    "mgmtYears" TEXT NOT NULL DEFAULT '',
    "traits" TEXT NOT NULL DEFAULT '',
    "motivation" TEXT NOT NULL DEFAULT '',
    "challenges" TEXT NOT NULL DEFAULT '',
    "learnStyle" TEXT NOT NULL DEFAULT '',
    "techLevel" TEXT NOT NULL DEFAULT '',
    "assessOnline" TEXT NOT NULL DEFAULT '',
    "assessOffline" TEXT NOT NULL DEFAULT '',
    "assessDisc" TEXT NOT NULL DEFAULT '',
    "assessMbti" TEXT NOT NULL DEFAULT '',
    "assess360" TEXT NOT NULL DEFAULT '',
    "assessCustom" TEXT NOT NULL DEFAULT '',
    "trainingHistory" TEXT NOT NULL DEFAULT '',
    "projectExp" TEXT NOT NULL DEFAULT '',
    "trackNotes" TEXT NOT NULL DEFAULT '',
    "projectId" TEXT NOT NULL,
    CONSTRAINT "LearnerPersona_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LearnerPersona" ("age", "assess360", "assessCustom", "assessDisc", "assessMbti", "challenges", "department", "id", "learnStyle", "mgmtYears", "motivation", "name", "position", "projectId", "techLevel", "trackNotes", "traits", "yearsExp") SELECT "age", "assess360", "assessCustom", "assessDisc", "assessMbti", "challenges", "department", "id", "learnStyle", "mgmtYears", "motivation", "name", "position", "projectId", "techLevel", "trackNotes", "traits", "yearsExp" FROM "LearnerPersona";
DROP TABLE "LearnerPersona";
ALTER TABLE "new_LearnerPersona" RENAME TO "LearnerPersona";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
