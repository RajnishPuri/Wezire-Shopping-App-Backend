/*
  Warnings:

  - You are about to drop the column `userId` on the `SellerProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sellerId]` on the table `SellerProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sellerId` to the `SellerProfile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SellerProfile" DROP CONSTRAINT "SellerProfile_userId_fkey";

-- DropIndex
DROP INDEX "SellerProfile_userId_key";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "deliveryDate" SET DEFAULT (now() + interval '10 days');

-- AlterTable
ALTER TABLE "Otp" ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '10 minutes');

-- AlterTable
ALTER TABLE "SellerProfile" DROP COLUMN "userId",
ADD COLUMN     "sellerId" TEXT NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "profilePhoto" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "shopDetails" DROP NOT NULL,
ALTER COLUMN "rating" DROP NOT NULL,
ALTER COLUMN "totalSales" DROP NOT NULL,
ALTER COLUMN "totalIncome" DROP NOT NULL,
ALTER COLUMN "about" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfile_sellerId_key" ON "SellerProfile"("sellerId");

-- AddForeignKey
ALTER TABLE "SellerProfile" ADD CONSTRAINT "SellerProfile_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;
