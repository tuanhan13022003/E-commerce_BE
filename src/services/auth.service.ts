/**
 * Authentication Service
 * Uses helper functions to eliminate code duplication
 * Handles auth business logic, transactions, tokens
 */

import { timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import { db } from '@/config/database';
import { users, otpVerifications } from '@/database/schema/users.schema';
import { eq, and, desc } from 'drizzle-orm';
import { isOtpExpired } from '@/utils/otp.util';
import { AppError } from '@/middlewares/error.middleware';
import {
  verifyPassword,
  createEmailUser,
  createPhoneUser,
  generateAndSendOtp,
  generateAuthTokens,
  formatUserResponse,
} from '@/services/auth/auth.helpers';
import type {
  RegisterEmailInput,
  RegisterPhoneInput,
  VerifyOtpInput,
  ResendOtpInput,
  LoginEmailInput,
  LoginPhoneInput
} from '@/validators/auth.validator';

class AuthService {
  /**
   * Register with email
   * Uses transaction to ensure data consistency
   * Uses helpers to reduce duplication
   */
  async registerWithEmail(data: RegisterEmailInput) {
    const userValues = await createEmailUser(data.email, data.password, data.fullName);

    const [newUser] = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values(userValues)
        .returning();

      const otpCode = await generateAndSendOtp(data.email, 'register');
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await tx.insert(otpVerifications).values({
        userId: user.userId,
        email: data.email,
        otpCode,
        purpose: 'register',
        expiresAt,
        isVerified: false,
      });

      return [user];
    });

    return {
      success: true,
      message: 'Registration successful. Please verify your email with the OTP sent.',
      data: formatUserResponse(newUser),
    };
  }

  /**
   * Register with phone number
   * Uses transaction to ensure data consistency
   */
  async registerWithPhone(data: RegisterPhoneInput) {
    const userValues = await createPhoneUser(data.email, data.phone, data.password, data.fullName);

    const [newUser] = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values(userValues)
        .returning();

      const otpCode = await generateAndSendOtp(data.email, 'register');
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await tx.insert(otpVerifications).values({
        userId: user.userId,
        email: data.email,
        otpCode,
        purpose: 'register',
        expiresAt,
        isVerified: false,
      });

      return [user];
    });

    return {
      success: true,
      message: 'Registration successful. Please verify your email with the OTP sent.',
      data: formatUserResponse(newUser),
    };
  }

  /**
   * Verify OTP and activate account
   * Timing-safe OTP comparison
   */
  async verifyOtp(data: VerifyOtpInput) {
    const [otpRecord] = await db
      .select()
      .from(otpVerifications)
      .where(
        and(
          eq(otpVerifications.email, data.email),
          eq(otpVerifications.purpose, data.purpose),
          eq(otpVerifications.isVerified, false)
        )
      )
      .orderBy(desc(otpVerifications.createdAt))
      .limit(1);

    if (!otpRecord) {
      throw new AppError(404, 'OTP_NOT_FOUND', 'No OTP record found for this email and purpose');
    }

    if (isOtpExpired(otpRecord.expiresAt)) {
      throw new AppError(400, 'OTP_EXPIRED', 'OTP code has expired. Please request a new one');
    }

    // Timing-safe comparison
    try {
      const otpBuffer = Buffer.from(otpRecord.otpCode);
      const inputBuffer = Buffer.from(data.otpCode);

      if (otpBuffer.length !== inputBuffer.length) {
        throw new AppError(400, 'OTP_INCORRECT', 'OTP code is incorrect');
      }

      timingSafeEqual(otpBuffer, inputBuffer);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(400, 'OTP_INCORRECT', 'OTP code is incorrect');
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        isVerified: true,
        lastLoginAt: new Date()
      })
      .where(eq(users.userId, otpRecord.userId!))
      .returning();

    await db
      .update(otpVerifications)
      .set({ isVerified: true })
      .where(eq(otpVerifications.otpId, otpRecord.otpId));

    const tokens = generateAuthTokens(updatedUser);

    return {
      success: true,
      message: 'Verification successful',
      data: {
        user: formatUserResponse(updatedUser),
        tokens,
      },
    };
  }

  /**
   * Resend OTP
   */
  async resendOtp(data: ResendOtpInput) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'No user found with this email');
    }

    if (user.isVerified) {
      throw new AppError(400, 'ALREADY_VERIFIED', 'Account is already verified');
    }

    const otpCode = await generateAndSendOtp(data.email, 'register');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.insert(otpVerifications).values({
      userId: user.userId,
      email: data.email,
      otpCode,
      purpose: 'register',
      expiresAt,
      isVerified: false,
    });

    return {
      success: true,
      message: 'New OTP code has been sent to your email',
    };
  }

  /**
   * Login with email and password
   * Uses helper for password verification
   */
  async loginWithEmail(data: LoginEmailInput) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    if (!user.isVerified) {
      throw new AppError(403, 'EMAIL_NOT_VERIFIED', 'Please verify your email before logging in');
    }

    if (!user.isActive) {
      throw new AppError(403, 'ACCOUNT_DISABLED', 'Your account has been disabled');
    }

    const isPasswordValid = await verifyPassword(data.password, user.passwordHash!);
    if (!isPasswordValid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.userId, user.userId));

    const tokens = generateAuthTokens(user);

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: formatUserResponse(user),
        tokens,
      },
    };
  }

  /**
   * Login with phone and password
   * Uses helper for password verification
   */
  async loginWithPhone(data: LoginPhoneInput) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.phone, data.phone))
      .limit(1);

    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid phone or password');
    }

    if (!user.isVerified) {
      throw new AppError(403, 'EMAIL_NOT_VERIFIED', 'Please verify your email before logging in');
    }

    if (!user.isActive) {
      throw new AppError(403, 'ACCOUNT_DISABLED', 'Your account has been disabled');
    }

    const isPasswordValid = await verifyPassword(data.password, user.passwordHash!);
    if (!isPasswordValid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid phone or password');
    }

    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.userId, user.userId));

    const tokens = generateAuthTokens(user);

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: formatUserResponse(user),
        tokens,
      },
    };
  }

  /**
   * Logout - Blacklist tokens
   */
  async logout(accessToken: string, refreshToken?: string) {
    const { blacklistToken } = await import('@/config/redis');

    try {
      const decoded = jwt.decode(accessToken) as { exp?: number };
      if (decoded?.exp) {
        const expirySeconds = Math.ceil(decoded.exp - Date.now() / 1000);
        if (expirySeconds > 0) {
          await blacklistToken(accessToken, expirySeconds);
        }
      }

      if (refreshToken) {
        const refreshDecoded = jwt.decode(refreshToken) as { exp?: number };
        if (refreshDecoded?.exp) {
          const refreshExpirySeconds = Math.ceil(refreshDecoded.exp - Date.now() / 1000);
          if (refreshExpirySeconds > 0) {
            await blacklistToken(refreshToken, refreshExpirySeconds);
          }
        }
      }
    } catch (error) {
      console.error('Error blacklisting tokens:', error);
    }

    return {
      success: true,
      message: 'Logout successful',
    };
  }
}

export default new AuthService();
