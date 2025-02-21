import prisma from "../prisma";

const deleteExpiredOtps = async () => {
    try {
        const result = await prisma.otp.deleteMany({
            where: { expiresAt: { lt: new Date() } },
        });
        console.log(`✅ Deleted ${result.count} expired OTPs.`);
    } catch (error) {
        console.error("❌ Error deleting expired OTPs:", error);
    }
};

setInterval(deleteExpiredOtps, 60 * 1000);
