/*
  Warnings:

  - You are about to drop the `VerifyUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VerifyUser" DROP CONSTRAINT "VerifyUser_userId_fkey";

-- DropTable
DROP TABLE "VerifyUser";

-- CreateTable
CREATE TABLE "UserVerify" (
    "userVerifyId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" VARCHAR(36) NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "UserVerify_pkey" PRIMARY KEY ("userVerifyId")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserVerify_token_key" ON "UserVerify"("token");

-- AddForeignKey
ALTER TABLE "UserVerify" ADD CONSTRAINT "UserVerify_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
