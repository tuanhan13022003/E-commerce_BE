/**
 * Authentication Service Helpers
 * Extract common logic to DRY up auth service
 */

import bcrypt from 'bcryptjs';
import { db } from '@/config/database';
import { users } from '@/database/schema/users.schema';
import { eq } from 'drizzle-orm';
import { generateOtpCode } from '@/utils/otp.util';
import { generateAccessToken, generateRefreshToken } from '@/utils/jwt.util';
import { sendOtpEmail } from '@/utils/email.util';
import { AppError } from '@/middlewares/error.middleware';
import { BCRYPT_SALT_ROUNDS, OTP_EXPIRY_MS, DEFAULT_USER_ROLE } from '@/constants/auth';

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Create user with email
 */
export async function createEmailUser(
  email: string,
  password: string,
  fullName: string
) {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new AppError(409, 'EMAIL_ALREADY_EXISTS', 'Email already in use');
  }

  const passwordHash = await hashPassword(password);

  return {
    email,
    passwordHash,
    fullName,
    provider: 'local' as const,
    isVerified: false,
    isActive: true,
    role: DEFAULT_USER_ROLE,
  };
}

/**
 * Create user with phone
 */
export async function createPhoneUser(
  email: string,
  phone: string,
  password: string,
  fullName: string
) {
  // Check if phone exists
  const existingPhone = await db
    .select()
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1);

  if (existingPhone.length > 0) {
    throw new AppError(409, 'PHONE_ALREADY_EXISTS', 'Phone number already in use');
  }

  // Check if email exists
  const existingEmail = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingEmail.length > 0) {
    throw new AppError(409, 'EMAIL_ALREADY_EXISTS', 'Email already in use');
  }

  const passwordHash = await hashPassword(password);

  return {
    phone,
    email,
    passwordHash,
    fullName,
    provider: 'local' as const,
    isVerified: false,
    isActive: true,
    role: DEFAULT_USER_ROLE,
  };
}

/**
 * Generate and send OTP
 */
export async function generateAndSendOtp(
  email: string,
  purpose: 'register' | 'reset_password'
): Promise<string> {
  const otpCode = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await sendOtpEmail(email, otpCode, purpose);

  return otpCode;
}

/**
 * Generate auth tokens
 */
export function generateAuthTokens(user: {
  userId: number;
  email: string | null;
  phone: string | null;
  role: string | null;
}) {
  const payload = {
    userId: user.userId,
    email: user.email,
    phone: user.phone,
    role: user.role || DEFAULT_USER_ROLE,
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

/**
 * Format user response (exclude sensitive fields)
 */
export function formatUserResponse(user: any) {
  return {
    userId: user.userId,
    email: user.email,
    phone: user.phone,
    fullName: user.fullName,
    role: user.role,
  };
}
