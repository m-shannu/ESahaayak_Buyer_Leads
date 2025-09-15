/*
  Warnings:

  - You are about to alter the column `budgetMax` on the `buyers` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `budgetMin` on the `buyers` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_buyers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "bhk" TEXT,
    "purpose" TEXT NOT NULL,
    "budgetMin" BIGINT,
    "budgetMax" BIGINT,
    "timeline" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'New',
    "notes" TEXT,
    "tags" TEXT,
    "ownerId" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_buyers" ("bhk", "budgetMax", "budgetMin", "city", "email", "id", "name", "notes", "ownerId", "phone", "propertyType", "purpose", "source", "status", "tags", "timeline", "updatedAt") SELECT "bhk", "budgetMax", "budgetMin", "city", "email", "id", "name", "notes", "ownerId", "phone", "propertyType", "purpose", "source", "status", "tags", "timeline", "updatedAt" FROM "buyers";
DROP TABLE "buyers";
ALTER TABLE "new_buyers" RENAME TO "buyers";
CREATE UNIQUE INDEX "buyers_email_key" ON "buyers"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
