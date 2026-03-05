/**
 * Authentication Constants
 */

// OTP Configuration
export const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes in milliseconds
export const OTP_LENGTH = 6; // OTP code length

// JWT Configuration
export const JWT_EXPIRY_HOURS = 24; // Access token expiry (hours)
export const JWT_REFRESH_EXPIRY_DAYS = 30; // Refresh token expiry (days)

// Bcrypt Configuration
export const BCRYPT_SALT_ROUNDS = 12; // More secure than default 10

// Password Configuration
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

// Default User Role
export const DEFAULT_USER_ROLE = 'customer' as const;

// Login Attempts & Lockout
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
