import { db } from '@/config/database';
import { users } from '@/database/schema/users.schema';
import { eq } from 'drizzle-orm';
import { AppError } from '@/middlewares/error.middleware';
import type { UpdateProfileInput } from '@/validators/profile.validator';

class ProfileService {
  /**
   * Get user profile by ID
   */
  async getProfile(userId: number) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        userId: user.userId,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        address: user.address,
        gender: user.gender,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        loyaltyPoints: user.loyaltyPoints,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: number, data: UpdateProfileInput) {
    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);

    if (!existingUser) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    // Check if phone is being updated and if it's already in use by another user
    if (data.phone && data.phone !== existingUser.phone) {
      const [phoneExists] = await db
        .select()
        .from(users)
        .where(eq(users.phone, data.phone))
        .limit(1);

      if (phoneExists) {
        throw new AppError(409, 'PHONE_ALREADY_EXISTS', 'Phone number already in use');
      }
    }

    // Build update object - only include fields that were provided
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.gender !== undefined) updateData.gender = data.gender;

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.userId, userId))
      .returning();

    return {
      success: true,
      message: 'Profile updated successfully',
      data: {
        userId: updatedUser.userId,
        email: updatedUser.email,
        phone: updatedUser.phone,
        fullName: updatedUser.fullName,
        avatarUrl: updatedUser.avatarUrl,
        address: updatedUser.address,
        gender: updatedUser.gender,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        isActive: updatedUser.isActive,
        loyaltyPoints: updatedUser.loyaltyPoints,
        createdAt: updatedUser.createdAt,
        lastLoginAt: updatedUser.lastLoginAt,
      },
    };
  }
}

export default new ProfileService();
