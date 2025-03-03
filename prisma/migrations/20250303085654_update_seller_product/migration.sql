/*
  Warnings:

  - You are about to drop the `SellerProduct` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `price` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stock` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SellerProduct" DROP CONSTRAINT "SellerProduct_productId_fkey";

-- DropForeignKey
ALTER TABLE "SellerProduct" DROP CONSTRAINT "SellerProduct_sellerId_fkey";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "deliveryDate" SET DEFAULT (now() + interval '10 days');

-- AlterTable
ALTER TABLE "Otp" ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '10 minutes');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "sellerId" TEXT NOT NULL,
ADD COLUMN     "stock" INTEGER NOT NULL;

-- DropTable
DROP TABLE "SellerProduct";

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;
