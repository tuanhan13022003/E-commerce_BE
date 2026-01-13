import { registry } from '../index';
import { getProductsQuerySchema, getProductDetailParamsSchema } from '@/validators/products.validator';
import { z } from 'zod';

// Product schema
const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  discountPrice: z.number().nullable(),
  categoryId: z.number(),
  brandId: z.number().nullable(),
  images: z.array(z.string()),
  rating: z.number().nullable(),
  reviewCount: z.number(),
  isFeatured: z.boolean(),
  isNew: z.boolean(),
  isBestseller: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).openapi('Product');

// Products list response
const productsListResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    products: z.array(productSchema),
    pagination: z.object({
      page: z.number(),
      pageSize: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  }),
}).openapi('ProductsListResponse');

// Product detail response
const productDetailResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    product: productSchema,
  }),
}).openapi('ProductDetailResponse');

const errorResponseSchema = z.object({
  success: z.boolean(),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
  }),
}).openapi('ErrorResponse');

// Register Product Routes
export function registerProductRoutes() {
  // GET /products
  registry.registerPath({
    method: 'get',
    path: '/products',
    tags: ['Products'],
    summary: 'Get products list',
    description: 'Get a paginated list of products with filters and sorting',
    request: {
      query: getProductsQuerySchema,
    },
    responses: {
      200: {
        description: 'Products retrieved successfully',
        content: {
          'application/json': {
            schema: productsListResponseSchema,
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

  // GET /products/:identifier
  registry.registerPath({
    method: 'get',
    path: '/products/{identifier}',
    tags: ['Products'],
    summary: 'Get product detail',
    description: 'Get detailed information of a product by slug or ID',
    request: {
      params: getProductDetailParamsSchema,
    },
    responses: {
      200: {
        description: 'Product retrieved successfully',
        content: {
          'application/json': {
            schema: productDetailResponseSchema,
          },
        },
      },
      404: {
        description: 'Product not found',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });
}
