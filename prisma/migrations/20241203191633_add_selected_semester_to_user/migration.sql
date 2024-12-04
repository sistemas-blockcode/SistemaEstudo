-- AlterTable
ALTER TABLE "User" ADD COLUMN     "selectedSemesterId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_selectedSemesterId_fkey" FOREIGN KEY ("selectedSemesterId") REFERENCES "Semester"("id") ON DELETE SET NULL ON UPDATE CASCADE;
