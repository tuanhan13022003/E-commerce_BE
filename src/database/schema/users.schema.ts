//Users table 

import { pgTable, serial, varchar, boolean, timestamp, index, integer } from "drizzle-orm/pg-core"
import e from "express";

export const users = pgTable('users', {
  userId: serial('user_id').primaryKey(),

  email: varchar('email', { length: 255 }).unique(),
  phone: varchar('phone', { length: 20 }).unique(),

  passwordHash: varchar('password_hash', { length: 255 }),
  fullName: varchar('full_name', { length: 255 }),
  avatarUrl: varchar('avatar_url', { length: 500 }),

  provider: varchar('provider', { length: 20 }).default('local'),
  providerId: varchar('provider_id', { length: 255 }),

  isVerified: boolean('is_verified').default(false),
  isActive: boolean('is_active').default(true),

  role: varchar('role', { length: 20 }).default('customer'),

  loyaltyPoints: integer('loyalty_points').default(0),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
  phoneIdx: index('idx_users_phone').on(table.phone),
  roleIdx: index('idx_users_role').on(table.role),
}));


// OTP Verifications - CHỈ LƯU EMAIL (vì chỉ gửi OTP qua email)
export const otpVerifications = pgTable('otp_verifications', {
  otpId: serial('otp_id').primaryKey(),
  userId: integer('user_id'),
  
  // Email nhận OTP (bắt buộc)
  email: varchar('email', { length: 255 }).notNull(),
  
  otpCode: varchar('otp_code', { length: 10 }).notNull(),
  
  // Purpose: 'register', 'reset_password', 'verify_account'
  purpose: varchar('purpose', { length: 20 }).notNull(),

  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  emailIdx: index('idx_otp_verifications_email').on(table.email),
  expiresAtIdx: index('idx_otp_verifications_expires_at').on(table.expiresAt),
})); 

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type OtpVerification = typeof otpVerifications.$inferSelect;
export type NewOtpVerification = typeof otpVerifications.$inferInsert;
