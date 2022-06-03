-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'GUEST', 'MODERATOR', 'ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "UnitSystem" AS ENUM ('IMPERIAL', 'METRIC');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('GLOBAL', 'LOCAL');

-- CreateEnum
CREATE TYPE "SearchType" AS ENUM ('HOT', 'NEW');

-- CreateEnum
CREATE TYPE "ThemeWeb" AS ENUM ('LIGHT', 'DARK');

-- CreateEnum
CREATE TYPE "SpotRatingType" AS ENUM ('NONE', 'LIKE', 'DISLIKE');

-- CreateEnum
CREATE TYPE "CommentRatingType" AS ENUM ('NONE', 'LIKE', 'DISLIKE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'TAG', 'ALERT');

-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('OFFENSIVE', 'HATE', 'MATURE', 'OTHER');

-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('PROFILE_PICTURE', 'CHAT_ROOM');

-- CreateTable
CREATE TABLE "User" (
    "userId" UUID NOT NULL,
    "email" VARCHAR(255),
    "emailUpdatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "username" VARCHAR(255) NOT NULL,
    "usernameUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phone" VARCHAR(255),
    "phoneUpdatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "password" VARCHAR(1024),
    "salt" VARCHAR(256),
    "role" "UserRole" NOT NULL,
    "profilePictureSrc" VARCHAR(255),
    "facebookId" VARCHAR(255),
    "googleId" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "UserMetadata" (
    "userMetadataId" UUID NOT NULL,
    "unitSystem" "UnitSystem" NOT NULL DEFAULT E'IMPERIAL',
    "locationType" "LocationType" NOT NULL DEFAULT E'GLOBAL',
    "searchType" "SearchType" NOT NULL DEFAULT E'HOT',
    "themeWeb" "ThemeWeb" NOT NULL DEFAULT E'LIGHT',
    "matureFilter" BOOLEAN NOT NULL DEFAULT true,
    "score" INTEGER NOT NULL DEFAULT 0,
    "userId" UUID NOT NULL,

    CONSTRAINT "UserMetadata_pkey" PRIMARY KEY ("userMetadataId")
);

-- CreateTable
CREATE TABLE "Spot" (
    "spotId" UUID NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "geolocation" VARCHAR(255) NOT NULL,
    "content" VARCHAR(3000) NOT NULL,
    "link" VARCHAR(14) NOT NULL,
    "imageSrc" VARCHAR(255),
    "imageNsfw" BOOLEAN DEFAULT false,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "totalComments" INTEGER NOT NULL DEFAULT 0,
    "hotRanking" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "owner" UUID NOT NULL,

    CONSTRAINT "Spot_pkey" PRIMARY KEY ("spotId")
);

-- CreateTable
CREATE TABLE "Comment" (
    "commentId" UUID NOT NULL,
    "content" VARCHAR(400) NOT NULL,
    "link" VARCHAR(14) NOT NULL,
    "imageSrc" VARCHAR(255),
    "imageNsfw" BOOLEAN DEFAULT false,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "owner" UUID NOT NULL,
    "spotId" UUID NOT NULL,
    "parentCommentId" UUID,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("commentId")
);

-- CreateTable
CREATE TABLE "SpotRating" (
    "spotRatingId" UUID NOT NULL,
    "rating" "SpotRatingType" NOT NULL DEFAULT E'NONE',
    "spotId" UUID NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "SpotRating_pkey" PRIMARY KEY ("spotRatingId")
);

-- CreateTable
CREATE TABLE "CommentRating" (
    "commentRatingId" UUID NOT NULL,
    "rating" "CommentRatingType" NOT NULL DEFAULT E'NONE',
    "commentId" UUID NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "CommentRating_pkey" PRIMARY KEY ("commentRatingId")
);

-- CreateTable
CREATE TABLE "Notification" (
    "notificationId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT E'INFO',
    "content" VARCHAR(255),
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" UUID NOT NULL,
    "receiverId" UUID NOT NULL,
    "spotId" UUID,
    "commentId" UUID,
    "replyId" UUID,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notificationId")
);

-- CreateTable
CREATE TABLE "Report" (
    "reportId" UUID NOT NULL,
    "content" VARCHAR(300) NOT NULL,
    "category" "ReportCategory" NOT NULL DEFAULT E'OFFENSIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reporterId" UUID NOT NULL,
    "spotId" UUID,
    "commentId" UUID,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("reportId")
);

-- CreateTable
CREATE TABLE "Friend" (
    "friendId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "userId" UUID NOT NULL,
    "friendUserId" UUID NOT NULL,

    CONSTRAINT "Friend_pkey" PRIMARY KEY ("friendId")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "passwordResetId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" VARCHAR(36) NOT NULL,
    "link" UUID NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("passwordResetId")
);

-- CreateTable
CREATE TABLE "UserVerify" (
    "userVerifyId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" VARCHAR(36) NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "UserVerify_pkey" PRIMARY KEY ("userVerifyId")
);

-- CreateTable
CREATE TABLE "UserLocation" (
    "userLocationId" UUID NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL,

    CONSTRAINT "UserLocation_pkey" PRIMARY KEY ("userLocationId")
);

-- CreateTable
CREATE TABLE "CommentTag" (
    "tagId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "offset" INTEGER NOT NULL,
    "userId" UUID NOT NULL,
    "taggerId" UUID NOT NULL,
    "spotId" UUID NOT NULL,
    "commentId" UUID NOT NULL,
    "commentParentId" UUID,

    CONSTRAINT "CommentTag_pkey" PRIMARY KEY ("tagId")
);

-- CreateTable
CREATE TABLE "UserImage" (
    "userImageId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "imageSrc" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "type" "ImageType" NOT NULL,

    CONSTRAINT "UserImage_pkey" PRIMARY KEY ("userImageId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_facebookId_key" ON "User"("facebookId");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserMetadata_userId_key" ON "UserMetadata"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Spot_link_key" ON "Spot"("link");

-- CreateIndex
CREATE UNIQUE INDEX "Comment_link_key" ON "Comment"("link");

-- CreateIndex
CREATE UNIQUE INDEX "SpotRating_userId_spotId_key" ON "SpotRating"("userId", "spotId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentRating_userId_commentId_key" ON "CommentRating"("userId", "commentId");

-- CreateIndex
CREATE UNIQUE INDEX "Friend_userId_friendUserId_key" ON "Friend"("userId", "friendUserId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_link_key" ON "PasswordReset"("link");

-- CreateIndex
CREATE UNIQUE INDEX "UserVerify_token_key" ON "UserVerify"("token");

-- AddForeignKey
ALTER TABLE "UserMetadata" ADD CONSTRAINT "UserMetadata_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Spot" ADD CONSTRAINT "Spot_owner_fkey" FOREIGN KEY ("owner") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_owner_fkey" FOREIGN KEY ("owner") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "Spot"("spotId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "Comment"("commentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotRating" ADD CONSTRAINT "SpotRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotRating" ADD CONSTRAINT "SpotRating_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "Spot"("spotId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentRating" ADD CONSTRAINT "CommentRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentRating" ADD CONSTRAINT "CommentRating_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("commentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "Spot"("spotId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("commentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "Comment"("commentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "Spot"("spotId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("commentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_friendUserId_fkey" FOREIGN KEY ("friendUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVerify" ADD CONSTRAINT "UserVerify_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLocation" ADD CONSTRAINT "UserLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentTag" ADD CONSTRAINT "CommentTag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentTag" ADD CONSTRAINT "CommentTag_taggerId_fkey" FOREIGN KEY ("taggerId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentTag" ADD CONSTRAINT "CommentTag_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "Spot"("spotId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentTag" ADD CONSTRAINT "CommentTag_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("commentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentTag" ADD CONSTRAINT "CommentTag_commentParentId_fkey" FOREIGN KEY ("commentParentId") REFERENCES "Comment"("commentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserImage" ADD CONSTRAINT "UserImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
