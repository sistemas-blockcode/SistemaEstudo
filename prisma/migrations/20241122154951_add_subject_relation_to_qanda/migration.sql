-- AlterTable
ALTER TABLE "QandA" ADD COLUMN     "subjectId" TEXT;

-- AddForeignKey
ALTER TABLE "QandA" ADD CONSTRAINT "QandA_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
