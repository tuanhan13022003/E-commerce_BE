/**
 * Cart Endpoints Documentation
 */

import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { addToCartSchema, updateCartItemSchema, getCartQuerySchema } from '@/validators/cart.validator';
import { errorResponseSchema } from './schemas';

export function registerCartEndpoints(registry: OpenAPIRegistry) {
  // Get cart
  registry.registerPath({
    method: 'get',
    path: '/cart',
    tags: ['Cart'],
    security: [{ bearerAuth: [] }],
    request: {
      query: getCartQuerySchema,
    },
    responses: {
      200: {
        description: 'Cart retrieved successfully with pagination',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: { type: 'object' },
                    },
                    summary: {
                      type: 'object',
                      properties: {
                        totalItems: { type: 'integer' },
                        subTotal: { type: 'number' },
                        tax: { type: 'number' },
                        total: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    },
  });

  // Add to cart
  registry.registerPath({
    method: 'post',
    path: '/cart/items',
    tags: ['Cart'],
    security: [{ bearerAuth: [] }],
    request: { body: { content: { 'application/json': { schema: addToCartSchema } } } },
    responses: {
      201: {
        description: 'Item added to cart',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string' },
                data: { type: 'object' },
              },
            },
          },
        },
      },
      400: { description: 'Invalid product or insufficient stock', content: { 'application/json': { schema: errorResponseSchema } } },
      401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
      404: { description: 'Product not found', content: { 'application/json': { schema: errorResponseSchema } } },
    },
  });

  // Update cart item
  registry.registerPath({
    method: 'patch',
    path: '/cart/items/{cartItemId}',
    tags: ['Cart'],
    security: [{ bearerAuth: [] }],
    request: { body: { content: { 'application/json': { schema: updateCartItemSchema } } } },
    responses: {
      200: {
        description: 'Item quantity updated',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: { type: 'object' },
              },
            },
          },
        },
      },
      400: { description: 'Invalid quantity or insufficient stock', content: { 'application/json': { schema: errorResponseSchema } } },
      401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
      404: { description: 'Item not found in cart', content: { 'application/json': { schema: errorResponseSchema } } },
    },
  });

  // Delete cart item
  registry.registerPath({
    method: 'delete',
    path: '/cart/items/{cartItemId}',
    tags: ['Cart'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Item removed from cart',
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
      404: { description: 'Item not found in cart', content: { 'application/json': { schema: errorResponseSchema } } },
    },
  });

  // Clear cart
  registry.registerPath({
    method: 'delete',
    path: '/cart',
    tags: ['Cart'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Cart cleared successfully',
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
