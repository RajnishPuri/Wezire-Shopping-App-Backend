/*
  Warnings:

  - You are about to drop the column `userId` on the `CustomerProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[customerId]` on the table `CustomerProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customerId` to the `CustomerProfile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CustomerProfile" DROP CONSTRAINT "CustomerProfile_userId_fkey";

-- DropIndex
DROP INDEX "CustomerProfile_userId_key";

-- AlterTable
ALTER TABLE "CustomerProfile" DROP COLUMN "userId",
ADD COLUMN     "customerId" TEXT NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "profilePhoto" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "deliveryDate" SET DEFAULT (now() + interval '10 days');

-- AlterTable
ALTER TABLE "Otp" ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '10 minutes');

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfile_customerId_key" ON "CustomerProfile"("customerId");

-- AddForeignKey
ALTER TABLE "CustomerProfile" ADD CONSTRAINT "CustomerProfile_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
