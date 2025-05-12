-- DropForeignKey
ALTER TABLE "OrderPayment" DROP CONSTRAINT "OrderPayment_transactionId_fkey";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "deliveryDate" SET DEFAULT (now() + interval '10 days');

-- AlterTable
ALTER TABLE "Otp" ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '10 minutes');
