-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_subjectId_fkey";

-- AlterTable
ALTER TABLE "Quiz" ALTER COLUMN "subjectId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
