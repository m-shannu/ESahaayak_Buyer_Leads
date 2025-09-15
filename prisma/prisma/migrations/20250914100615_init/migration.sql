/*
  Warnings:

  - The primary key for the `Buyer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `bhk` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `budgetMax` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `budgetMin` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `propertyType` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `purpose` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `timeline` on the `Buyer` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Buyer` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `BuyerHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `changedBy` on the `BuyerHistory` table. All the data in the column will be lost.
  - You are about to alter the column `buyerId` on the `BuyerHistory` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `id` on the `BuyerHistory` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `name` to the `Buyer` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `Buyer` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Buyer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Buyer" ("email", "id", "notes", "phone", "updatedAt") SELECT "email", "id", "notes", "phone", "updatedAt" FROM "Buyer";
DROP TABLE "Buyer";
ALTER TABLE "new_Buyer" RENAME TO "Buyer";
CREATE UNIQUE INDEX "Buyer_email_key" ON "Buyer"("email");
CREATE TABLE "new_BuyerHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "buyerId" INTEGER NOT NULL,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diff" TEXT,
    CONSTRAINT "BuyerHistory_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BuyerHistory" ("buyerId", "changedAt", "diff", "id") SELECT "buyerId", "changedAt", "diff", "id" FROM "BuyerHistory";
DROP TABLE "BuyerHistory";
ALTER TABLE "new_BuyerHistory" RENAME TO "BuyerHistory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
