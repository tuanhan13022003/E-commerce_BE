import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

/**
 * Schema for updating user profile
 */
export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(255, 'Full name must not exceed 255 characters')
    .optional()
    .openapi({ example: 'John Doe', description: 'User full name' }),

  phone: z
    .string()
    .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Invalid Vietnamese phone number')
    .optional()
    .openapi({ example: '0912345678', description: 'Vietnamese phone number' }),

  avatarUrl: z
    .string()
    .url('Invalid URL format')
    .max(500, 'Avatar URL must not exceed 500 characters')
    .optional()
    .openapi({ example: 'https://example.com/avatar.jpg', description: 'Avatar image URL' }),

  address: z
    .string()
    .max(500, 'Address must not exceed 500 characters')
    .optional()
    .openapi({ example: '123 Main St, City, Country', description: 'User address' }),

  gender: z
    .enum(['male', 'female', 'other'])
    .optional()
    .openapi({ example: 'male', description: 'User gender' }),
}).openapi('UpdateProfileRequest');

/**
 * TypeScript types inferred from schemas
 */
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
