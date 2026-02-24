/**
 * Generate a random 6-digit OTP code
 * @returns A string of 6 random digits
 */
export const generateOtpCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Calculate OTP expiration time
 * @param minutes - Number of minutes until expiration (default: 5)
 * @returns Date object representing the expiration time
 */
export const getOtpExpirationTime = (minutes: number = 5): Date => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * Check if an OTP has expired
 * @param expiresAt - The expiration date
 * @returns True if expired, false otherwise
 */
export const isOtpExpired = (expiresAt: Date): boolean => {
  return new Date() > new Date(expiresAt);
};
