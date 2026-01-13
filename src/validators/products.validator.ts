import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

//Query params Get Products

export const getProductsQuerySchema = z.object({
    // Pagination
    page: z.string().optional().default('1').transform(Number).openapi({ example: '1', description: 'Page number' }),
    pageSize: z.string().optional().default('20').transform(Number).openapi({ example: '20', description: 'Items per page' }),
    // Filters
    categoryId: z.string().optional().transform(val => val ? Number(val) : undefined).openapi({ example: '1', description: 'Filter by category ID' }),
    brandId: z.string().optional().transform(val => val ? val.split(',').map(Number) : undefined).openapi({ example: '1,2,3', description: 'Filter by brand IDs (comma-separated)' }),
    //Price Range
    minPrice: z.string().optional().transform(val => val ? Number(val) : undefined).openapi({ example: '100000', description: 'Minimum price filter' }),
    maxPrice: z.string().optional().transform(val => val ? Number(val) : undefined).openapi({ example: '500000', description: 'Maximum price filter' }),
    // Rating filter
  minRating: z.string().optional().transform(val => val ? Number(val) : undefined).openapi({ example: '4', description: 'Minimum rating filter (1-5)' }),

  // Sorting
  sortBy: z.enum(['price', 'rating', 'newest', 'popular', 'name', 'discount']).optional().default('newest').openapi({ example: 'newest', description: 'Sort by field' }),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc').openapi({ example: 'desc', description: 'Sort order' }),

  // Search
  search: z.string().optional().openapi({ example: 'laptop', description: 'Search keyword' }),

  // Other filters
  isFeatured: z.string().optional().transform(val => val === 'true' ? true : undefined).openapi({ example: 'true', description: 'Filter featured products' }),
  isNew: z.string().optional().transform(val => val === 'true' ? true : undefined).openapi({ example: 'true', description: 'Filter new products' }),
  isBestseller: z.string().optional().transform(val => val === 'true' ? true : undefined).openapi({ example: 'true', description: 'Filter bestseller products' }),
  isActive: z.string().optional().default('true').transform(val => val === 'true').openapi({ example: 'true', description: 'Filter active products' })
}).openapi('GetProductsQuery');
export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>;

// Params cho Get Product Detail
export const getProductDetailParamsSchema = z.object({
  identifier: z.string().min(1).openapi({ example: 'product-slug-123', description: 'Product slug or ID' })
}).openapi('GetProductDetailParams');

export type GetProductDetailParams = z.infer<typeof getProductDetailParamsSchema>;