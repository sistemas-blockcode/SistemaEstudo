/*
  Warnings:

  - Added the required column `semesterId` to the `QandA` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QandA" ADD COLUMN     "semesterId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "QandA" ADD CONSTRAINT "QandA_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
