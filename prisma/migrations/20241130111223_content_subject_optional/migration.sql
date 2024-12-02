-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_subjectId_fkey";

-- AlterTable
ALTER TABLE "Content" ALTER COLUMN "subjectId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
