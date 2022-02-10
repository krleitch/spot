-- CreateTable
CREATE TABLE `User` (
    `userId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `emailUpdatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `username` VARCHAR(255) NOT NULL,
    `usernameUpdatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `phone` VARCHAR(255) NOT NULL,
    `phoneUpdatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `password` VARCHAR(1024) NOT NULL,
    `salt` VARCHAR(256) NOT NULL,
    `role` ENUM('USER', 'GUEST', 'MODERATOR', 'ADMIN', 'OWNER') NOT NULL,
    `profilePictureSrc` VARCHAR(255) NULL,
    `facebookId` VARCHAR(36) NULL,
    `googleId` VARCHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `verifiedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_phone_key`(`phone`),
    UNIQUE INDEX `User_facebookId_key`(`facebookId`),
    UNIQUE INDEX `User_googleId_key`(`googleId`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserMetadata` (
    `userMetadataId` VARCHAR(191) NOT NULL,
    `unitSystem` ENUM('IMPERIAL', 'METRIC') NOT NULL DEFAULT 'IMPERIAL',
    `locationType` ENUM('GLOBAL', 'LOCAL') NOT NULL DEFAULT 'GLOBAL',
    `searchType` ENUM('HOT', 'NEW') NOT NULL DEFAULT 'HOT',
    `themeWeb` ENUM('LIGHT', 'DARK') NOT NULL DEFAULT 'LIGHT',
    `matureFilter` BOOLEAN NOT NULL DEFAULT true,
    `score` INTEGER NOT NULL DEFAULT 0,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `UserMetadata_userId_key`(`userId`),
    PRIMARY KEY (`userMetadataId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Spot` (
    `spotId` VARCHAR(191) NOT NULL,
    `longitude` DECIMAL(9, 6) NOT NULL,
    `latitude` DECIMAL(9, 6) NOT NULL,
    `geolocation` VARCHAR(255) NOT NULL,
    `content` VARCHAR(3000) NOT NULL,
    `link` VARCHAR(14) NOT NULL,
    `imageSrc` VARCHAR(255) NOT NULL,
    `imageNsfw` BOOLEAN NOT NULL DEFAULT false,
    `likes` INTEGER NOT NULL DEFAULT 0,
    `dislikes` INTEGER NOT NULL DEFAULT 0,
    `totalComments` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Spot_link_key`(`link`),
    PRIMARY KEY (`spotId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comment` (
    `commentId` VARCHAR(191) NOT NULL,
    `content` VARCHAR(400) NOT NULL,
    `link` VARCHAR(14) NOT NULL,
    `imageSrc` VARCHAR(255) NOT NULL,
    `imageNsfw` BOOLEAN NOT NULL DEFAULT false,
    `likes` INTEGER NOT NULL DEFAULT 0,
    `dislikes` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `parentCommentId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Comment_link_key`(`link`),
    PRIMARY KEY (`commentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SpotRating` (
    `spotRatingId` VARCHAR(191) NOT NULL,
    `rating` ENUM('NONE', 'LIKE', 'DISLIKE') NOT NULL DEFAULT 'NONE',
    `spotId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`spotRatingId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommentRating` (
    `commentRatingId` VARCHAR(191) NOT NULL,
    `rating` ENUM('NONE', 'LIKE', 'DISLIKE') NOT NULL DEFAULT 'NONE',
    `commentId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`commentRatingId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `notificationId` VARCHAR(191) NOT NULL,
    `type` ENUM('INFO', 'TAG', 'ALERT') NOT NULL DEFAULT 'INFO',
    `content` VARCHAR(255) NULL,
    `seen` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `senderId` VARCHAR(191) NOT NULL,
    `receiverId` VARCHAR(191) NOT NULL,
    `spotId` VARCHAR(191) NULL,
    `commentId` VARCHAR(191) NULL,
    `replyId` VARCHAR(191) NULL,

    PRIMARY KEY (`notificationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Report` (
    `reportId` VARCHAR(191) NOT NULL,
    `content` VARCHAR(300) NOT NULL,
    `category` ENUM('OFFENSIVE', 'HATE', 'MATURE', 'OTHER') NOT NULL DEFAULT 'OFFENSIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reporterId` VARCHAR(191) NOT NULL,
    `spotId` VARCHAR(191) NULL,
    `commentId` VARCHAR(191) NULL,

    PRIMARY KEY (`reportId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Friend` (
    `friendId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `confirmedAt` DATETIME(3) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `friendUserId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`friendId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordReset` (
    `passwordResetId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `token` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `PasswordReset_token_key`(`token`),
    PRIMARY KEY (`passwordResetId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerifyUser` (
    `verifyUserId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `token` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `VerifyUser_token_key`(`token`),
    PRIMARY KEY (`verifyUserId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserLocation` (
    `userLocationId` VARCHAR(191) NOT NULL,
    `longitude` DECIMAL(9, 6) NOT NULL,
    `latitude` DECIMAL(9, 6) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`userLocationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommentTag` (
    `tagId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `offset` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `taggerId` VARCHAR(191) NOT NULL,
    `spotId` VARCHAR(191) NOT NULL,
    `commentId` VARCHAR(191) NOT NULL,
    `commentParentId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserMetadata` ADD CONSTRAINT `UserMetadata_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Spot` ADD CONSTRAINT `Spot_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_parentCommentId_fkey` FOREIGN KEY (`parentCommentId`) REFERENCES `Comment`(`commentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SpotRating` ADD CONSTRAINT `SpotRating_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SpotRating` ADD CONSTRAINT `SpotRating_spotId_fkey` FOREIGN KEY (`spotId`) REFERENCES `Spot`(`spotId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommentRating` ADD CONSTRAINT `CommentRating_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommentRating` ADD CONSTRAINT `CommentRating_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `Comment`(`commentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_spotId_fkey` FOREIGN KEY (`spotId`) REFERENCES `Spot`(`spotId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `Comment`(`commentId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_replyId_fkey` FOREIGN KEY (`replyId`) REFERENCES `Comment`(`commentId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_spotId_fkey` FOREIGN KEY (`spotId`) REFERENCES `Spot`(`spotId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `Comment`(`commentId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Friend` ADD CONSTRAINT `Friend_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Friend` ADD CONSTRAINT `Friend_friendUserId_fkey` FOREIGN KEY (`friendUserId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordReset` ADD CONSTRAINT `PasswordReset_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VerifyUser` ADD CONSTRAINT `VerifyUser_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserLocation` ADD CONSTRAINT `UserLocation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommentTag` ADD CONSTRAINT `CommentTag_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommentTag` ADD CONSTRAINT `CommentTag_taggerId_fkey` FOREIGN KEY (`taggerId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommentTag` ADD CONSTRAINT `CommentTag_spotId_fkey` FOREIGN KEY (`spotId`) REFERENCES `Spot`(`spotId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommentTag` ADD CONSTRAINT `CommentTag_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `Comment`(`commentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommentTag` ADD CONSTRAINT `CommentTag_commentParentId_fkey` FOREIGN KEY (`commentParentId`) REFERENCES `Comment`(`commentId`) ON DELETE RESTRICT ON UPDATE CASCADE;
