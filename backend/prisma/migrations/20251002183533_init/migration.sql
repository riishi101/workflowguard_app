/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Workflow` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `Workflow` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Workflow` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Workflow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hubspotId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Workflow_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Workflow" ("createdAt", "hubspotId", "id", "name", "ownerId", "updatedAt") SELECT "createdAt", "hubspotId", "id", "name", "ownerId", "updatedAt" FROM "Workflow";
DROP TABLE "Workflow";
ALTER TABLE "new_Workflow" RENAME TO "Workflow";
CREATE UNIQUE INDEX "Workflow_hubspotId_key" ON "Workflow"("hubspotId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
