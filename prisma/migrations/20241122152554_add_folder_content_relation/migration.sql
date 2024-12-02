-- AlterTable
ALTER TABLE "Content" ADD COLUMN     "folderId" TEXT;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
