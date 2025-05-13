import * as crypto from 'crypto';

// Razorpay Signature Verification
export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET as string);
    hmac.update(orderId + "|" + paymentId);
    const digest = hmac.digest("hex");
    return digest === signature;
}

module.exports = { verifyRazorpaySignature };
