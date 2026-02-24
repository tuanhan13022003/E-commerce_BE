import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

// Get cart query params
export const getCartQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number).openapi({ example: '1', description: 'Page number' }),
  pageSize: z.string().optional().default('10').transform(Number).openapi({ example: '10', description: 'Items per page' }),
  search: z.string().optional().openapi({ example: 'laptop', description: 'Search by product name' }),
  sortBy: z.enum(['price', 'quantity', 'newest', 'oldest']).optional().default('newest').openapi({ example: 'newest', description: 'Sort field' }),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc').openapi({ example: 'desc', description: 'Sort order' }),
  minPrice: z.string().optional().transform(val => val ? Number(val) : undefined).openapi({ example: '100000', description: 'Min price filter' }),
  maxPrice: z.string().optional().transform(val => val ? Number(val) : undefined).openapi({ example: '5000000', description: 'Max price filter' }),
}).openapi('GetCartQuery');

export type GetCartQuery = z.infer<typeof getCartQuerySchema>;

export const addToCartSchema = z.object({
  productId: z.number().int().positive().openapi({ example: 1, description: 'Product ID' }),
  quantity: z.number().int().min(1).max(100).default(1).openapi({ example: 1, description: 'Quantity (1-100)' }),
}).openapi('AddToCartRequest');

export type AddToCartInput = z.infer<typeof addToCartSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(100).openapi({ example: 2, description: 'New quantity (1-100)' }),
}).openapi('UpdateCartItemRequest');

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export const cartItemParamsSchema = z.object({
  cartItemId: z.string().transform(val => {
    const num = Number(val);
    if (isNaN(num) || num <= 0) {
      throw new Error('Invalid cart item ID');
    }
    return num;
  }).openapi({ example: '1', description: 'Cart Item ID' }),
}).openapi('CartItemParams');

export type CartItemParams = z.infer<typeof cartItemParamsSchema>;
