/*
  Warnings:

  - You are about to drop the column `subjectId` on the `QandA` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "QandA" DROP CONSTRAINT "QandA_subjectId_fkey";

-- AlterTable
ALTER TABLE "QandA" DROP COLUMN "subjectId";
