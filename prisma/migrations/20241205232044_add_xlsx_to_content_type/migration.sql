/*
  Warnings:

  - The values [LINK] on the enum `ContentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ContentType_new" AS ENUM ('PDF', 'VIDEO', 'DOCX', 'IMG', 'PPTX', 'XLSX');
ALTER TABLE "Content" ALTER COLUMN "tipo" TYPE "ContentType_new" USING ("tipo"::text::"ContentType_new");
ALTER TYPE "ContentType" RENAME TO "ContentType_old";
ALTER TYPE "ContentType_new" RENAME TO "ContentType";
DROP TYPE "ContentType_old";
COMMIT;
