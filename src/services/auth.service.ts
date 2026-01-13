import bcrypt from 'bcryptjs';
import { db } from '@/config/database';
import { users, otpVerifications } from '@/database/schema/users.schema';
import { eq, and, or, desc } from 'drizzle-orm';
import { generateOtpCode, getOtpExpirationTime, isOtpExpired } from '@/utils/otp.util';
import { generateAccessToken, generateRefreshToken } from '@/utils/jwt.util';
import { sendOtpEmail } from '@/utils/email.util';
import { successResponse, errorResponse } from '@/utils/response.util';
import { AppError } from '@/middlewares/error.middleware';
import type {
  RegisterEmailInput,
  RegisterPhoneInput,
  VerifyOtpInput,
  ResendOtpInput,
  LoginEmailInput,
  LoginPhoneInput
} from '@/validators/auth.validator';


class AuthService {
  //registter with email
  async registerWithEmail(data: RegisterEmailInput) {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1)

    if (existingUser.length > 0) {
      throw new AppError(409, 'EMAIL_ALREADY_EXISTS', 'Email already in use');
    }

    const passWordHash = await bcrypt.hash(data.password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        email: data.email,
        passwordHash: passWordHash,
        fullName: data.fullName,
        provider: 'local',
        isVerified: false,
        isActive: true,
        role: 'customer',
      })
      .returning();

    // Generate OTP code
    const otpCode = generateOtpCode();
    const expiresAt = getOtpExpirationTime(5);

    await db.insert(otpVerifications).values({
      userId: newUser.userId,
      email: data.email,
      otpCode,
      purpose: 'register',
      expiresAt,
      isVerified: false,
    });

    //send OTP email
    await sendOtpEmail(data.email, otpCode, 'register');

    return {
      success: true,
      message: 'Registration successful. Please verify your email with the OTP sent.',
      data: {
        userId: newUser.userId,
        phone: newUser.phone,
        email: newUser.email,
      },
    };
  }

  /**
   * Register with phone number (requires email for OTP)
   */
  async registerWithPhone(data: RegisterPhoneInput) {
    // Check if phone exists
    const existingPhone = await db
      .select()
      .from(users)
      .where(eq(users.phone, data.phone))
      .limit(1);

    if (existingPhone.length > 0) {
      throw new AppError(409, 'PHONE_ALREADY_EXISTS', 'Phone number already in use');
    }

    // Check if email exists
    const existingEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingEmail.length > 0) {
      throw new AppError(409, 'EMAIL_ALREADY_EXISTS', 'Email already in use');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        phone: data.phone,
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        provider: 'local',
        isVerified: false,
        isActive: true,
        role: 'customer',
      })
      .returning();

    // Generate OTP
    const otpCode = generateOtpCode();
    const expiresAt = getOtpExpirationTime(5);

    await db.insert(otpVerifications).values({
      userId: newUser.userId,
      email: data.email,
      otpCode,
      purpose: 'register',
      expiresAt,
      isVerified: false,
    });

    // Send OTP via email
    await sendOtpEmail(data.email, otpCode, 'register');

    return {
      success: true,
      message: 'Registration successful. Please verify your email with the OTP sent.',
      data: {
        userId: newUser.userId,
        phone: newUser.phone,
        email: newUser.email,
      },
    };
  }

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

    if (otpRecord.otpCode !== data.otpCode) {
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

    const payload = {
      userId: updatedUser.userId,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role!,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // 7. Return
    return {
      success: true,
      message: 'Verification successful',
      data: {
        user: {
          userId: updatedUser.userId,
          email: updatedUser.email,
          phone: updatedUser.phone,
          fullName: updatedUser.fullName,
          role: updatedUser.role,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    };
  }

  /**
   * Gửi lại OTP
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

    const otpCode = generateOtpCode();
    const expiresAt = getOtpExpirationTime(5);

    await db.insert(otpVerifications).values({
      userId: user.userId,
      email: data.email,
      otpCode,
      purpose: 'register',
      expiresAt,
      isVerified: false,
    });

    await sendOtpEmail(data.email, otpCode, 'register');

    return {
      success: true,
      message: 'New OTP code has been sent to your email',
    };
  }

  /**
   * Login with email and password
   */
  async loginWithEmail(data: LoginEmailInput) {
    // 1. Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // 2. Check if user is verified
    if (!user.isVerified) {
      throw new AppError(403, 'EMAIL_NOT_VERIFIED', 'Please verify your email before logging in');
    }

    // 3. Check if user is active
    if (!user.isActive) {
      throw new AppError(403, 'ACCOUNT_DISABLED', 'Your account has been disabled');
    }

    // 4. Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash!);
    if (!isPasswordValid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // 5. Update last login time
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.userId, user.userId));

    // 6. Generate tokens
    const payload = {
      userId: user.userId,
      email: user.email,
      phone: user.phone,
      role: user.role!,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // 7. Return user info and tokens
    return {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          userId: user.userId,
          email: user.email,
          phone: user.phone,
          fullName: user.fullName,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    };
  }

  /**
   * Login with phone and password
   */
  async loginWithPhone(data: LoginPhoneInput) {
    // 1. Find user by phone
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.phone, data.phone))
      .limit(1);

    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid phone or password');
    }

    // 2. Check if user is verified
    if (!user.isVerified) {
      throw new AppError(403, 'EMAIL_NOT_VERIFIED', 'Please verify your email before logging in');
    }

    // 3. Check if user is active
    if (!user.isActive) {
      throw new AppError(403, 'ACCOUNT_DISABLED', 'Your account has been disabled');
    }

    // 4. Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash!);
    if (!isPasswordValid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid phone or password');
    }

    // 5. Update last login time
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.userId, user.userId));

    // 6. Generate tokens
    const payload = {
      userId: user.userId,
      email: user.email,
      phone: user.phone,
      role: user.role!,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // 7. Return user info and tokens
    return {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          userId: user.userId,
          email: user.email,
          phone: user.phone,
          fullName: user.fullName,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    };
  }

  /**
   * Logout - Invalidate tokens (can be enhanced with token blacklist)
   */
  async logout() {
    // TODO: Implement token blacklist in Redis for invalidating tokens
    // For now, just return success - client should delete tokens
    return {
      success: true,
      message: 'Logout successful',
    };
  }
}

export default new AuthService();