/**
 * Shared OpenAPI Response Schemas
 * Reusable across all endpoints
 */

export const errorResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    code: { type: 'string', example: 'VALIDATION_ERROR' },
    message: { type: 'string', example: 'Invalid input' },
    details: { type: 'object' },
  },
} as any;

export const tokenSchema = {
  type: 'object',
  properties: {
    accessToken: { type: 'string', description: 'JWT access token' },
    refreshToken: { type: 'string', description: 'JWT refresh token' },
  },
} as any;

export const userSchema = {
  type: 'object',
  properties: {
    userId: { type: 'integer' },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string', nullable: true },
    fullName: { type: 'string' },
    role: { type: 'string', enum: ['customer', 'admin'] },
  },
} as any;
