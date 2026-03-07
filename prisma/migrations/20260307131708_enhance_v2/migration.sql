-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Facilitator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT '',
    "expertise" TEXT NOT NULL DEFAULT '',
    "credentials" TEXT NOT NULL DEFAULT '',
    "module" TEXT NOT NULL DEFAULT '',
    "days" REAL NOT NULL DEFAULT 0,
    "dailyRate" REAL NOT NULL DEFAULT 0,
    "totalFee" REAL NOT NULL DEFAULT 0,
    "contractStatus" TEXT NOT NULL DEFAULT 'pending',
    "lastScore" TEXT NOT NULL DEFAULT '',
    "renew" TEXT NOT NULL DEFAULT '',
    "contact" TEXT NOT NULL DEFAULT '',
    "projectId" TEXT NOT NULL,
    CONSTRAINT "Facilitator_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Facilitator" ("contact", "contractStatus", "credentials", "dailyRate", "days", "expertise", "id", "lastScore", "module", "name", "projectId", "renew", "totalFee") SELECT "contact", "contractStatus", "credentials", "dailyRate", "days", "expertise", "id", "lastScore", "module", "name", "projectId", "renew", "totalFee" FROM "Facilitator";
DROP TABLE "Facilitator";
ALTER TABLE "new_Facilitator" RENAME TO "Facilitator";
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
    "assessDisc" TEXT NOT NULL DEFAULT '',
    "assessMbti" TEXT NOT NULL DEFAULT '',
    "assess360" TEXT NOT NULL DEFAULT '',
    "assessCustom" TEXT NOT NULL DEFAULT '',
    "trackNotes" TEXT NOT NULL DEFAULT '',
    "projectId" TEXT NOT NULL,
    CONSTRAINT "LearnerPersona_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LearnerPersona" ("age", "challenges", "department", "id", "learnStyle", "mgmtYears", "motivation", "name", "position", "projectId", "techLevel", "traits", "yearsExp") SELECT "age", "challenges", "department", "id", "learnStyle", "mgmtYears", "motivation", "name", "position", "projectId", "techLevel", "traits", "yearsExp" FROM "LearnerPersona";
DROP TABLE "LearnerPersona";
ALTER TABLE "new_LearnerPersona" RENAME TO "LearnerPersona";
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "org" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "revenue" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("createdAt", "currentStep", "description", "id", "name", "org", "status", "updatedAt", "userId") SELECT "createdAt", "currentStep", "description", "id", "name", "org", "status", "updatedAt", "userId" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
