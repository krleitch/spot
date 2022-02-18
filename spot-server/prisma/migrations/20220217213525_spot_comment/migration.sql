/*
  Warnings:

  - Added the required column `spotId` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "spotId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "Spot"("spotId") ON DELETE RESTRICT ON UPDATE CASCADE;
