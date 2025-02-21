-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SELLER', 'CUSTOMER');

-- AlterTable
ALTER TABLE "Otp" ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '10 minutes');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'CUSTOMER';

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "profilePhoto" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
