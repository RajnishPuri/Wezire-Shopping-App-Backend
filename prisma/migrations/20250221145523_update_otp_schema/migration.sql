-- CreateTable
CREATE TABLE "Otp" (
    "id" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT (now() + interval '10 minutes'),

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Otp_otp_key" ON "Otp"("otp");
