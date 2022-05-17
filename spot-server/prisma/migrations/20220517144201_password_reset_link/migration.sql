/*
  Warnings:

  - The required column `link` was added to the `PasswordReset` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "PasswordReset" ADD COLUMN     "link" UUID NOT NULL;
