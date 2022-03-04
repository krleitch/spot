-- DropForeignKey
ALTER TABLE "CommentTag" DROP CONSTRAINT "CommentTag_commentParentId_fkey";

-- AlterTable
ALTER TABLE "CommentTag" ALTER COLUMN "commentParentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CommentTag" ADD CONSTRAINT "CommentTag_commentParentId_fkey" FOREIGN KEY ("commentParentId") REFERENCES "Comment"("commentId") ON DELETE SET NULL ON UPDATE CASCADE;
