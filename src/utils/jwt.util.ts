import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

interface JwtPayload {
  userId: number;
  email: string | null;
  phone: string | null;
  role: string;
}

/**
 * Generate access token
 */
export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET!, {
    expiresIn: env.JWT_EXPIRES_IN || '7d' as any,
  });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET!, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN || '30d' as any,
  });
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET!) as JwtPayload;
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET!) as JwtPayload;
};
