import nodemailer from "nodemailer";

const getTransporter = () => (process.env.SMTP_HOST || process.env.EMAIL_HOST)
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || process.env.EMAIL_HOST,
      port: Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
      },
    })
  : null;

export const sendVerificationCode = async (email, code) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[verification] ${email}: ${code}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER,
    to: email,
    subject: "Your StreamHub verification code",
    text: `Your StreamHub verification code is ${code}. It expires in 10 minutes.`,
  });
};