import { Request, Response, NextFunction } from 'express';
import authService from '@/services/auth.service';
import {
  registerEmailSchema,
  registerPhoneSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginEmailSchema,
  loginPhoneSchema,
  logoutSchema
} from '@/validators/auth.validator';

class AuthController {
  /**
   * Register with email
   * POST /api/v1/auth/register/email
   */
  async registerEmail(req: Request, res: Response, next: NextFunction) {
    // #swagger.tags = ['Authentication']
    // #swagger.summary = 'Đăng ký tài khoản bằng email'
    // #swagger.description = 'Đăng ký tài khoản mới sử dụng email. Sau khi đăng ký thành công, OTP sẽ được gửi đến email để xác thực.'
    /* #swagger.requestBody = {
      required: true,
      content: { "application/json": { schema: { $ref: '#/definitions/RegisterEmailRequest' }}}
    } */
    /* #swagger.responses[201] = {
      description: 'Đăng ký thành công, vui lòng kiểm tra email để xác thực OTP',
      content: { "application/json": { schema: { $ref: '#/definitions/OtpResponse' }}}
    } */
    /* #swagger.responses[400] = {
      description: 'Dữ liệu không hợp lệ hoặc email đã tồn tại',
      content: { "application/json": { schema: { $ref: '#/definitions/ErrorResponse' }}}
    } */
    try {
      const validatedData = registerEmailSchema.parse(req.body);
      const result = await authService.registerWithEmail(validatedData);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register with phone
   * POST /api/v1/auth/register/phone
   */
  async registerPhone(req: Request, res: Response, next: NextFunction) {
    // #swagger.tags = ['Authentication']
    // #swagger.summary = 'Đăng ký tài khoản bằng số điện thoại'
    // #swagger.description = 'Đăng ký tài khoản mới sử dụng số điện thoại. Sau khi đăng ký thành công, OTP sẽ được gửi đến email để xác thực.'
    /* #swagger.requestBody = {
      required: true,
      content: { "application/json": { schema: { $ref: '#/definitions/RegisterPhoneRequest' }}}
    } */
    /* #swagger.responses[201] = {
      description: 'Đăng ký thành công, vui lòng kiểm tra email để xác thực OTP',
      content: { "application/json": { schema: { $ref: '#/definitions/OtpResponse' }}}
    } */
    /* #swagger.responses[400] = {
      description: 'Dữ liệu không hợp lệ hoặc số điện thoại đã tồn tại',
      content: { "application/json": { schema: { $ref: '#/definitions/ErrorResponse' }}}
    } */
    try {
      const validatedData = registerPhoneSchema.parse(req.body);
      const result = await authService.registerWithPhone(validatedData);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify OTP
   * POST /api/v1/auth/verify-otp
   */
  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    // #swagger.tags = ['Authentication']
    // #swagger.summary = 'Xác thực mã OTP'
    // #swagger.description = 'Xác thực mã OTP được gửi đến email. Sau khi xác thực thành công, tài khoản sẽ được kích hoạt.'
    /* #swagger.requestBody = {
      required: true,
      content: { "application/json": { schema: { $ref: '#/definitions/VerifyOtpRequest' }}}
    } */
    /* #swagger.responses[200] = {
      description: 'Xác thực OTP thành công',
      content: { "application/json": { schema: { $ref: '#/definitions/AuthSuccessResponse' }}}
    } */
    /* #swagger.responses[400] = {
      description: 'Mã OTP không hợp lệ hoặc đã hết hạn',
      content: { "application/json": { schema: { $ref: '#/definitions/ErrorResponse' }}}
    } */
    try {
      const validatedData = verifyOtpSchema.parse(req.body);
      const result = await authService.verifyOtp(validatedData);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resend OTP
   * POST /api/v1/auth/resend-otp
   */
  async resendOtp(req: Request, res: Response, next: NextFunction) {
    // #swagger.tags = ['Authentication']
    // #swagger.summary = 'Gửi lại mã OTP'
    // #swagger.description = 'Gửi lại mã OTP đến email khi mã cũ hết hạn hoặc không nhận được.'
    /* #swagger.requestBody = {
      required: true,
      content: { "application/json": { schema: { $ref: '#/definitions/ResendOtpRequest' }}}
    } */
    /* #swagger.responses[200] = {
      description: 'Gửi lại OTP thành công',
      content: { "application/json": { schema: { $ref: '#/definitions/OtpResponse' }}}
    } */
    /* #swagger.responses[400] = {
      description: 'Email không tồn tại hoặc đã được xác thực',
      content: { "application/json": { schema: { $ref: '#/definitions/ErrorResponse' }}}
    } */
    try {
      const validatedData = resendOtpSchema.parse(req.body);
      const result = await authService.resendOtp(validatedData);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login with email
   * POST /api/v1/auth/login/email
   */
  async loginEmail(req: Request, res: Response, next: NextFunction) {
    // #swagger.tags = ['Authentication']
    // #swagger.summary = 'Đăng nhập bằng email'
    // #swagger.description = 'Đăng nhập vào hệ thống sử dụng email và mật khẩu.'
    /* #swagger.requestBody = {
      required: true,
      content: { "application/json": { schema: { $ref: '#/definitions/LoginEmailRequest' }}}
    } */
    /* #swagger.responses[200] = {
      description: 'Đăng nhập thành công',
      content: { "application/json": { schema: { $ref: '#/definitions/AuthSuccessResponse' }}}
    } */
    /* #swagger.responses[400] = {
      description: 'Email chưa được xác thực',
      content: { "application/json": { schema: { $ref: '#/definitions/ErrorResponse' }}}
    } */
    /* #swagger.responses[401] = {
      description: 'Email hoặc mật khẩu không đúng',
      content: { "application/json": { schema: { $ref: '#/definitions/ErrorResponse' }}}
    } */
    try {
      const validatedData = loginEmailSchema.parse(req.body);
      const result = await authService.loginWithEmail(validatedData);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login with phone
   * POST /api/v1/auth/login/phone
   */
  async loginPhone(req: Request, res: Response, next: NextFunction) {
    // #swagger.tags = ['Authentication']
    // #swagger.summary = 'Đăng nhập bằng số điện thoại'
    // #swagger.description = 'Đăng nhập vào hệ thống sử dụng số điện thoại và mật khẩu.'
    /* #swagger.requestBody = {
      required: true,
      content: { "application/json": { schema: { $ref: '#/definitions/LoginPhoneRequest' }}}
    } */
    /* #swagger.responses[200] = {
      description: 'Đăng nhập thành công',
      content: { "application/json": { schema: { $ref: '#/definitions/AuthSuccessResponse' }}}
    } */
    /* #swagger.responses[400] = {
      description: 'Tài khoản chưa được xác thực',
      content: { "application/json": { schema: { $ref: '#/definitions/ErrorResponse' }}}
    } */
    /* #swagger.responses[401] = {
      description: 'Số điện thoại hoặc mật khẩu không đúng',
      content: { "application/json": { schema: { $ref: '#/definitions/ErrorResponse' }}}
    } */
    try {
      const validatedData = loginPhoneSchema.parse(req.body);
      const result = await authService.loginWithPhone(validatedData);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout
   * POST /api/v1/auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    // #swagger.tags = ['Authentication']
    // #swagger.summary = 'Đăng xuất'
    // #swagger.description = 'Đăng xuất khỏi hệ thống và vô hiệu hóa token.'
    // #swagger.security = [{ "bearerAuth": [] }]
    /* #swagger.responses[200] = {
      description: 'Đăng xuất thành công',
      content: {
        "application/json": {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string', example: 'Đăng xuất thành công' }
            }
          }
        }
      }
    } */
    /* #swagger.responses[401] = {
      description: 'Chưa đăng nhập hoặc token không hợp lệ',
      content: { "application/json": { schema: { $ref: '#/definitions/ErrorResponse' }}}
    } */
    try {
      logoutSchema.parse(req.body);
      const result = await authService.logout();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
