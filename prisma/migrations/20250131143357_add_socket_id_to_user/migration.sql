/*
  Warnings:

  - Added the required column `to` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "to" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "socketId" TEXT;
