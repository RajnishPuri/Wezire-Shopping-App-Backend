-- AlterTable
ALTER TABLE "Otp" ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '10 minutes');

-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "gender" SET DEFAULT '',
ALTER COLUMN "profilePhoto" SET DEFAULT '';
