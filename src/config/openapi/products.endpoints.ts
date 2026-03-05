/**
 * Products Endpoints Documentation
 */

import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { getProductsQuerySchema, getProductDetailParamsSchema } from '@/validators/products.validator';
import { errorResponseSchema } from './schemas';

export function registerProductsEndpoints(registry: OpenAPIRegistry) {
  // Get products list
  registry.registerPath({
    method: 'get',
    path: '/products',
    tags: ['Products'],
    request: {
      query: getProductsQuerySchema,
    },
    responses: {
      200: {
        description: 'Products list retrieved',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    products: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          productId: { type: 'integer' },
                          productName: { type: 'string' },
                          slug: { type: 'string' },
                          originalPrice: { type: 'number' },
                          salePrice: { type: 'number', nullable: true },
                          finalPrice: { type: 'number' },
                          averageRating: { type: 'number' },
                          totalReviews: { type: 'integer' },
                        },
                      },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer' },
                        pageSize: { type: 'integer' },
                        totalItems: { type: 'integer' },
                        totalPages: { type: 'integer' },
                        hasNextPage: { type: 'boolean' },
                        hasPreviousPage: { type: 'boolean' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      400: { description: 'Validation error', content: { 'application/json': { schema: errorResponseSchema } } },
    },
  });

  // Get product detail
  registry.registerPath({
    method: 'get',
    path: '/products/{identifier}',
    tags: ['Products'],
    request: {
      params: getProductDetailParamsSchema,
    },
    responses: {
      200: {
        description: 'Product detail retrieved',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    productId: { type: 'integer' },
                    productName: { type: 'string' },
                    description: { type: 'string' },
                    originalPrice: { type: 'number' },
                    salePrice: { type: 'number', nullable: true },
                    stockQuantity: { type: 'integer' },
                    averageRating: { type: 'number' },
                    images: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          imageId: { type: 'integer' },
                          imageUrl: { type: 'string' },
                          isPrimary: { type: 'boolean' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      404: { description: 'Product not found', content: { 'application/json': { schema: errorResponseSchema } } },
    },
  });
}
