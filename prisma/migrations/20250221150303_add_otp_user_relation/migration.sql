/*
  Warnings:

  - Added the required column `userId` to the `Otp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Otp" ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '10 minutes');

-- AddForeignKey
ALTER TABLE "Otp" ADD CONSTRAINT "Otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
