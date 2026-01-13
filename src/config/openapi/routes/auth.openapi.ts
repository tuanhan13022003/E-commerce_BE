import { registry } from '../index';
import {
  registerEmailSchema,
  registerPhoneSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginEmailSchema,
  loginPhoneSchema,
  logoutSchema,
} from '@/validators/auth.validator';
import { z } from 'zod';

// Response schemas
const authResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: z.object({
      id: z.number(),
      email: z.string().email(),
      fullName: z.string(),
      role: z.string(),
    }),
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
  message: z.string().optional(),
}).openapi('AuthResponse');

const messageResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
}).openapi('MessageResponse');

const errorResponseSchema = z.object({
  success: z.boolean(),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
  }),
}).openapi('ErrorResponse');

// Register Auth Routes
export function registerAuthRoutes() {
  // POST /auth/register/email
  registry.registerPath({
    method: 'post',
    path: '/auth/register/email',
    tags: ['Authentication'],
    summary: 'Register with email',
    description: 'Register a new user account using email and password',
    request: {
      body: {
        content: {
          'application/json': {
            schema: registerEmailSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'User registered successfully',
        content: {
          'application/json': {
            schema: authResponseSchema,
          },
        },
      },
      400: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });

  // POST /auth/register/phone
  registry.registerPath({
    method: 'post',
    path: '/auth/register/phone',
    tags: ['Authentication'],
    summary: 'Register with phone',
    description: 'Register a new user account using phone number',
    request: {
      body: {
        content: {
          'application/json': {
            schema: registerPhoneSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'User registered successfully',
        content: {
          'application/json': {
            schema: authResponseSchema,
          },
        },
      },
      400: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });

  // POST /auth/verify-otp
  registry.registerPath({
    method: 'post',
    path: '/auth/verify-otp',
    tags: ['Authentication'],
    summary: 'Verify OTP code',
    description: 'Verify OTP code sent to email',
    request: {
      body: {
        content: {
          'application/json': {
            schema: verifyOtpSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'OTP verified successfully',
        content: {
          'application/json': {
            schema: messageResponseSchema,
          },
        },
      },
      400: {
        description: 'Invalid OTP',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });

  // POST /auth/resend-otp
  registry.registerPath({
    method: 'post',
    path: '/auth/resend-otp',
    tags: ['Authentication'],
    summary: 'Resend OTP code',
    description: 'Resend OTP code to email',
    request: {
      body: {
        content: {
          'application/json': {
            schema: resendOtpSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'OTP sent successfully',
        content: {
          'application/json': {
            schema: messageResponseSchema,
          },
        },
      },
      400: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });

  // POST /auth/login/email
  registry.registerPath({
    method: 'post',
    path: '/auth/login/email',
    tags: ['Authentication'],
    summary: 'Login with email',
    description: 'Login using email and password',
    request: {
      body: {
        content: {
          'application/json': {
            schema: loginEmailSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Login successful',
        content: {
          'application/json': {
            schema: authResponseSchema,
          },
        },
      },
      401: {
        description: 'Invalid credentials',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });

  // POST /auth/login/phone
  registry.registerPath({
    method: 'post',
    path: '/auth/login/phone',
    tags: ['Authentication'],
    summary: 'Login with phone',
    description: 'Login using phone number and password',
    request: {
      body: {
        content: {
          'application/json': {
            schema: loginPhoneSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Login successful',
        content: {
          'application/json': {
            schema: authResponseSchema,
          },
        },
      },
      401: {
        description: 'Invalid credentials',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });

  // POST /auth/logout
  registry.registerPath({
    method: 'post',
    path: '/auth/logout',
    tags: ['Authentication'],
    summary: 'Logout',
    description: 'Logout current user session',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: logoutSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Logout successful',
        content: {
          'application/json': {
            schema: messageResponseSchema,
          },
        },
      },
      401: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });
}
