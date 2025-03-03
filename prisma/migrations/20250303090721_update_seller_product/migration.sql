-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "deliveryDate" SET DEFAULT (now() + interval '10 days');

-- AlterTable
ALTER TABLE "Otp" ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '10 minutes');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "images" TEXT[];
