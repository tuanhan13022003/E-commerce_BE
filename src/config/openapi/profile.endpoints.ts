/**
 * Profile Endpoints Documentation
 */

import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { updateProfileSchema } from '@/validators/profile.validator';
import { userSchema, errorResponseSchema } from './schemas';

export function registerProfileEndpoints(registry: OpenAPIRegistry) {
  // Get profile
  registry.registerPath({
    method: 'get',
    path: '/profile',
    tags: ['Profile'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Profile retrieved successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: userSchema,
              },
            },
          },
        },
      },
      401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    },
  });

  // Update profile
  registry.registerPath({
    method: 'patch',
    path: '/profile',
    tags: ['Profile'],
    security: [{ bearerAuth: [] }],
    request: { body: { content: { 'application/json': { schema: updateProfileSchema } } } },
    responses: {
      200: {
        description: 'Profile updated successfully',
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
      401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
      404: { description: 'User not found', content: { 'application/json': { schema: errorResponseSchema } } },
    },
  });
}
