import nodemailer from 'nodemailer';
import { env } from '@/config/env';

/**
 * Send OTP via email
 */
export const sendOtpEmail = async (
  email: string, 
  otpCode: string, 
  purpose: string
): Promise<void> => {
  if (!env.SMTP_HOST || !env.SMTP_USER) {
    console.log(`OTP Email (${purpose}):`, { email, otpCode });
    return;
  }

  // Production: send real email
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  });

  const subject = purpose === 'register' 
    ? 'Account registration verification' 
    : 'Account verification';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Your OTP Code</h2>
      <p>Your OTP code to ${purpose === 'register' ? 'register' : 'verify'} account:</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; text-align: center;">
        <h1 style="color: #4CAF50; font-size: 36px; margin: 0; letter-spacing: 5px;">${otpCode}</h1>
      </div>
      <p style="color: #666; margin-top: 20px;">This code will expire in <strong>5 minutes</strong>.</p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        If you did not request this code, please ignore this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: email,
    subject,
    html,
  });
};
