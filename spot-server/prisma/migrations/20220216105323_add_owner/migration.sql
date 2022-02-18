/*
  Warnings:

  - You are about to drop the column `userId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Spot` table. All the data in the column will be lost.
  - Added the required column `owner` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner` to the `Spot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Spot" DROP CONSTRAINT "Spot_userId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "userId",
ADD COLUMN     "owner" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Spot" DROP COLUMN "userId",
ADD COLUMN     "owner" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "Spot" ADD CONSTRAINT "Spot_owner_fkey" FOREIGN KEY ("owner") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_owner_fkey" FOREIGN KEY ("owner") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
