/*
  Warnings:

  - You are about to drop the column `to` on the `Message` table. All the data in the column will be lost.
  - Added the required column `toId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "to",
ADD COLUMN     "toId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Message_userId_toId_idx" ON "Message"("userId", "toId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_toId_fkey" FOREIGN KEY ("toId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
