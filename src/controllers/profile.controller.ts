import { Request, Response, NextFunction } from 'express';
import profileService from '@/services/profile.service';
import { updateProfileSchema } from '@/validators/profile.validator';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string | null;
    phone: string | null;
    role: string;
  };
}

class ProfileController {
  /**
   * Get current user profile
   * GET /api/v1/profile
   */
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // #swagger.tags = ['Profile']
    // #swagger.summary = 'Lấy thông tin hồ sơ người dùng'
    // #swagger.description = 'Lấy thông tin đầy đủ của người dùng hiện tại'
    // #swagger.security = [{ "bearerAuth": [] }]
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const result = await profileService.getProfile(req.user.userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   * PATCH /api/v1/profile
   */
  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // #swagger.tags = ['Profile']
    // #swagger.summary = 'Cập nhật thông tin hồ sơ'
    // #swagger.description = 'Cập nhật thông tin hồ sơ người dùng như tên, số điện thoại, địa chỉ, v.v'
    // #swagger.security = [{ "bearerAuth": [] }]
    /* #swagger.requestBody = {
      required: true,
      content: { "application/json": { schema: { $ref: '#/definitions/UpdateProfileRequest' }}}
    } */
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const validatedData = updateProfileSchema.parse(req.body);
      const result = await profileService.updateProfile(req.user.userId, validatedData);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new ProfileController();
