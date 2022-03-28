-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('PROFILE_PICTURE', 'CHAT_ROOM');

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

-- AddForeignKey
ALTER TABLE "UserImage" ADD CONSTRAINT "UserImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
