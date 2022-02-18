/*
  Warnings:

  - A unique constraint covering the columns `[userId,commentId]` on the table `CommentRating` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,friendUserId]` on the table `Friend` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,spotId]` on the table `SpotRating` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CommentRating_userId_commentId_key" ON "CommentRating"("userId", "commentId");

-- CreateIndex
CREATE UNIQUE INDEX "Friend_userId_friendUserId_key" ON "Friend"("userId", "friendUserId");

-- CreateIndex
CREATE UNIQUE INDEX "SpotRating_userId_spotId_key" ON "SpotRating"("userId", "spotId");
