-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_createdBy_fkey";

-- AlterTable
ALTER TABLE "Folder" ALTER COLUMN "createdBy" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
