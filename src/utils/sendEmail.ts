import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL as string,
        pass: process.env.EMAIL_PASSWORD as string,
    },
});

interface EmailPayload {
    subject: string;
    html: string;
}

const sendVerificationEmail = async (
    recipientEmail: string,
    payload: EmailPayload
): Promise<nodemailer.SentMessageInfo> => {
    const mailOptions = {
        from: "Wezire Shop || LeGiTCoDeR",
        to: recipientEmail,
        subject: payload.subject,
        html: payload.html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Verification email sent successfully!");
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Error sending verification email.");
    }
};

export default sendVerificationEmail;
