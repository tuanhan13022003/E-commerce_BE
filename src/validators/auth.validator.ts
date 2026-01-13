import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

/**
 * Schema for email registration
 */
export const registerEmailSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .openapi({ example: 'user@example.com', description: 'User email address' }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .openapi({ example: 'Password123', description: 'User password (min 8 chars, must contain uppercase, lowercase and number)' }),
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(255, 'Full name must not exceed 255 characters')
    .openapi({ example: 'John Doe', description: 'User full name' }),
}).openapi('RegisterEmailRequest');

/**
 * Schema for phone registration
 * Note: Email is required to receive OTP verification
 */
export const registerPhoneSchema = z.object({
  phone: z
    .string()
    .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Invalid Vietnamese phone number')
    .openapi({ example: '0912345678', description: 'Vietnamese phone number' }),
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required to receive verification code')
    .openapi({ example: 'user@example.com', description: 'Email to receive OTP' }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .openapi({ example: 'Password123', description: 'User password' }),
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(255, 'Full name must not exceed 255 characters')
    .openapi({ example: 'Nguyen Van A', description: 'User full name' }),
}).openapi('RegisterPhoneRequest');

/**
 * Schema for OTP verification
 */
export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email format').openapi({ example: 'user@example.com' }),
  otpCode: z.string().length(6, 'OTP code must be exactly 6 digits').openapi({ example: '123456' }),
  purpose: z.enum(['register', 'reset_password', 'verify_account']).openapi({ example: 'register' }),
}).openapi('VerifyOtpRequest');

/**
 * Schema for resending OTP
 */
export const resendOtpSchema = z.object({
  email: z.string().email('Invalid email format').openapi({ example: 'user@example.com' }),
}).openapi('ResendOtpRequest');

/**
 * Schema for login with email
 */
export const loginEmailSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required').openapi({ example: 'user@example.com' }),
  password: z.string().min(1, 'Password is required').openapi({ example: 'Password123' }),
}).openapi('LoginEmailRequest');

/**
 * Schema for login with phone
 */
export const loginPhoneSchema = z.object({
  phone: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Invalid Vietnamese phone number').openapi({ example: '0912345678' }),
  password: z.string().min(1, 'Password is required').openapi({ example: 'Password123' }),
}).openapi('LoginPhoneRequest');

/**
 * Schema for logout
 */
export const logoutSchema = z.object({
  refreshToken: z.string().optional().openapi({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }),
}).openapi('LogoutRequest');

/**
 * TypeScript types inferred from schemas
 */
export type RegisterEmailInput = z.infer<typeof registerEmailSchema>;
export type RegisterPhoneInput = z.infer<typeof registerPhoneSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type LoginEmailInput = z.infer<typeof loginEmailSchema>;
export type LoginPhoneInput = z.infer<typeof loginPhoneSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
