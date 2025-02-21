/*
  Warnings:

  - You are about to drop the column `userId` on the `Otp` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Otp` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Otp` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Otp" DROP CONSTRAINT "Otp_userId_fkey";

-- AlterTable
ALTER TABLE "Otp" DROP COLUMN "userId",
ADD COLUMN     "email" TEXT NOT NULL,
ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '10 minutes');

-- CreateIndex
CREATE UNIQUE INDEX "Otp_email_key" ON "Otp"("email");
