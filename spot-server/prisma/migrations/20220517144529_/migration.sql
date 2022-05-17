/*
  Warnings:

  - A unique constraint covering the columns `[link]` on the table `PasswordReset` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_link_key" ON "PasswordReset"("link");
