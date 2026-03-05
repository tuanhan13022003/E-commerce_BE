/**
 * Authentication Endpoints Documentation
 */

import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  registerEmailSchema,
  registerPhoneSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginEmailSchema,
  loginPhoneSchema,
} from '@/validators/auth.validator';
import { userSchema, tokenSchema, errorResponseSchema } from './schemas';

export function registerAuthEndpoints(registry: OpenAPIRegistry) {
  // Register with email
  registry.registerPath({
    method: 'post',
    path: '/auth/register/email',
    tags: ['Authentication'],
    request: { body: { content: { 'application/json': { schema: registerEmailSchema } } } },
    responses: {
      201: {
        description: 'User registered successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string' },
                data: userSchema,
              },
            },
          },
        },
      },
      400: { description: 'Validation error', content: { 'application/json': { schema: errorResponseSchema } } },
      409: { description: 'Email already exists', content: { 'application/json': { schema: errorResponseSchema } } },
    },
  });

  // Register with phone
  registry.registerPath({
    method: 'post',
    path: '/auth/register/phone',
    tags: ['Authentication'],
    request: { body: { content: { 'application/json': { schema: registerPhoneSchema } } } },
    responses: {
      201: {
        description: 'User registered successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string' },
                data: userSchema,
              },
            },
          },
        },
      },
      400: { description: 'Validation error', content: { 'application/json': { schema: errorResponseSchema } } },
      409: { description: 'Phone or email already exists', content: { 'application/json': { schema: errorResponseSchema } } },
    },
  });

  // Verify OTP
  registry.registerPath({
    method: 'post',
    path: '/auth/verify-otp',
    tags: ['Authentication'],
    request: { body: { content: { 'application/json': { schema: verifyOtpSchema } } } },
    responses: {
      200: {
        description: 'OTP verified successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string' },
                data: {
                  type: 'object',
                  properties: {
                    user: userSchema,
                    tokens: tokenSchema,
                  },
                },
              },
            },
          },
        },
      },
      400: { description: 'Invalid or expired OTP', content: { 'application/json': { schema: errorResponseSchema } } },
      404: { description: 'OTP not found', content: { 'application/json': { schema: errorResponseSchema } } },
    },
  });

  // Resend OTP
  registry.registerPath({
    method: 'post',
    path: '/auth/resend-otp',
    tags: ['Authentication'],
    request: { body: { content: { 'application/json': { schema: resendOtpSchema } } } },
    responses: {
      200: {
        description: 'OTP resent successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string' },
              },
            },
          },
        },
      },
      400: { description: 'Account already verified', content: { 'application/json': { schema: errorResponseSchema } } },
      404: { description: 'User not found', content: { 'application/json': { schema: errorResponseSchema } } },
    },
  });

  // Login with email
  registry.registerPath({
    method: 'post',
    path: '/auth/login/email',
    tags: ['Authentication'],
    request: { body: { content: { 'application/json': { schema: loginEmailSchema } } } },
    responses: {
      200: {
        description: 'Login successful',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string' },
                data: {
                  type: 'object',
                  properties: {
                    user: userSchema,
                    tokens: tokenSchema,
                  },
                },
              },
            },
          },
        },
      },
      401: { description: 'Invalid credentials', content: { 'application/json': { schema: errorResponseSchema } } },
      403: { description: 'Account not verified or disabled', content: { 'application/json': { schema: errorResponseSchema } } },
    },
  });

  // Login with phone
  registry.registerPath({
    method: 'post',
    path: '/auth/login/phone',
    tags: ['Authentication'],
    request: { body: { content: { 'application/json': { schema: loginPhoneSchema } } } },
    responses: {
      200: {
        description: 'Login successful',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string' },
                data: {
                  type: 'object',
                  properties: {
                    user: userSchema,
                    tokens: tokenSchema,
                  },
                },
              },
            },
          },
        },
      },
      401: { description: 'Invalid credentials', content: { 'application/json': { schema: errorResponseSchema } } },
      403: { description: 'Account not verified or disabled', content: { 'application/json': { schema: errorResponseSchema } } },
    },
  });

  // Logout
  registry.registerPath({
    method: 'post',
    path: '/auth/logout',
    tags: ['Authentication'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Logout successful',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string' },
              },
            },
          },
        },
      },
      401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    },
  });
}
