-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'CONFIRMED';

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "deliveryDate" SET DEFAULT (now() + interval '10 days');

-- AlterTable
ALTER TABLE "OrderPayment" ALTER COLUMN "transactionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Otp" ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '10 minutes');
