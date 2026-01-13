import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  // TODO: Implement password hashing
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  // TODO: Implement password comparison
  return bcrypt.compare(password, hash);
};
