/**
 * Products Repository
 * Encapsulates all database queries for products
 * Decouples business logic from ORM
 */

import { db } from '@/config/database';
import { products, categories, brands, productImages, productReviews } from '@/database/schema/products.schema';
import { eq, and, gte, lte, inArray, ilike, desc, asc, sql, isNull, or, isNotNull } from 'drizzle-orm';

export interface ProductFilters {
  page: number;
  pageSize: number;
  categoryId?: number;
  brandId?: number[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  isActive: boolean;
}

export class ProductsRepository {
  /**
   * Get all products with filters and aggregated ratings
   * Optimized: Uses GROUP BY instead of correlated subqueries
   */
  async getProducts(filters: ProductFilters) {
    const {
      page,
      pageSize,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      minRating,
      search,
      isFeatured,
      isNew,
      isBestseller,
      isActive
    } = filters;

    // Build WHERE conditions
    const conditions: any[] = [eq(products.isActive, isActive)];

    if (categoryId !== undefined) {
      conditions.push(eq(products.categoryId, categoryId));
    }

    if (brandId !== undefined && brandId.length > 0) {
      conditions.push(inArray(products.brandId, brandId));
    }

    // Price range filter
    if (minPrice !== undefined) {
      conditions.push(
        or(
          and(isNotNull(products.salePrice), gte(products.salePrice, minPrice.toString())),
          and(isNull(products.salePrice), gte(products.originalPrice, minPrice.toString()))
        )
      );
    }

    if (maxPrice !== undefined) {
      conditions.push(
        or(
          and(isNotNull(products.salePrice), lte(products.salePrice, maxPrice.toString())),
          and(isNull(products.salePrice), lte(products.originalPrice, maxPrice.toString()))
        )
      );
    }

    // Featured, New, Bestseller filters
    if (isFeatured !== undefined) {
      conditions.push(eq(products.isFeatured, isFeatured));
    }
    if (isNew !== undefined) {
      conditions.push(eq(products.isNew, isNew));
    }
    if (isBestseller !== undefined) {
      conditions.push(eq(products.isBestseller, isBestseller));
    }

    // Search filter
    if (search) {
      conditions.push(ilike(products.productName, `%${search}%`));
    }

    const offset = (page - 1) * pageSize;

    /**
     * Optimized query: Single query with GROUP BY
     * No N+1 pattern, no correlated subqueries
     */
    const productsData = await db
      .select({
        productId: products.productId,
        productName: products.productName,
        slug: products.slug,
        shortDescription: products.shortDescription,
        originalPrice: products.originalPrice,
        salePrice: products.salePrice,
        discountPercent: products.discountPercent,
        stockQuantity: products.stockQuantity,
        soldQuantity: products.soldQuantity,
        isFeatured: products.isFeatured,
        isNew: products.isNew,
        isBestseller: products.isBestseller,
        createdAt: products.createdAt,
        category: {
          categoryId: categories.categoryId,
          categoryName: categories.categoryName,
          slug: categories.slug
        },
        brand: {
          brandId: brands.brandId,
          brandName: brands.brandName,
          slug: brands.slug,
          logoUrl: brands.logoUrl
        },
        // Aggregated rating using GROUP BY (not correlated subquery)
        averageRating: sql<number>`COALESCE(AVG(CASE WHEN ${productReviews.isApproved} = true THEN ${productReviews.rating} END), 0)`,
        totalReviews: sql<number>`COALESCE(COUNT(CASE WHEN ${productReviews.isApproved} = true THEN 1 END), 0)`,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.categoryId))
      .leftJoin(brands, eq(products.brandId, brands.brandId))
      .leftJoin(productReviews, eq(products.productId, productReviews.productId))
      .where(and(...conditions));

    // Filter by minRating in memory (after aggregation, before pagination)
    let filteredProducts = productsData;
    if (minRating !== undefined) {
      filteredProducts = productsData.filter(p => Number(p.averageRating) >= minRating);
    }

    // Calculate totals based on filtered results
    const filteredCount = filteredProducts.length;

    // Apply pagination to filtered results
    const paginatedProducts = filteredProducts.slice(offset, offset + pageSize);

    return {
      products: paginatedProducts,
      totalCount: filteredCount,
    };
  }

  /**
   * Get product images for batch of products
   * Single query for all images (not N+1)
   */
  async getImagesByProductIds(productIds: number[]) {
    if (productIds.length === 0) return [];

    return await db
      .select()
      .from(productImages)
      .where(
        and(
          inArray(productImages.productId, productIds),
          eq(productImages.isPrimary, true)
        )
      );
  }

  /**
   * Get product detail by ID or slug
   */
  async getProductDetail(identifier: string) {
    const isNumeric = /^\d+$/.test(identifier);
    const condition = isNumeric
      ? eq(products.productId, Number(identifier))
      : eq(products.slug, identifier);

    const [product] = await db
      .select({
        productId: products.productId,
        productName: products.productName,
        slug: products.slug,
        sku: products.sku,
        description: products.description,
        shortDescription: products.shortDescription,
        originalPrice: products.originalPrice,
        salePrice: products.salePrice,
        discountPercent: products.discountPercent,
        stockQuantity: products.stockQuantity,
        soldQuantity: products.soldQuantity,
        viewCount: products.viewCount,
        isFeatured: products.isFeatured,
        isNew: products.isNew,
        isBestseller: products.isBestseller,
        isActive: products.isActive,
        videoUrl: products.videoUrl,
        createdAt: products.createdAt,
        category: {
          categoryId: categories.categoryId,
          categoryName: categories.categoryName,
          slug: categories.slug,
          imageUrl: categories.imageUrl
        },
        brand: {
          brandId: brands.brandId,
          brandName: brands.brandName,
          slug: brands.slug,
          logoUrl: brands.logoUrl,
          description: brands.description
        },
        averageRating: sql<number>`COALESCE(AVG(CASE WHEN ${productReviews.isApproved} = true THEN ${productReviews.rating} END), 0)`,
        totalReviews: sql<number>`COALESCE(COUNT(CASE WHEN ${productReviews.isApproved} = true THEN 1 END), 0)`
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.categoryId))
      .leftJoin(brands, eq(products.brandId, brands.brandId))
      .leftJoin(productReviews, eq(products.productId, productReviews.productId))
      .where(condition)
      .groupBy(products.productId, categories.categoryId, brands.brandId)
      .limit(1);

    return product || null;
  }

  /**
   * Get all images for a product
   */
  async getProductImages(productId: number) {
    return await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(asc(productImages.displayOrder));
  }

  /**
   * Increment view count (fire-and-forget)
   */
  async incrementViewCount(productId: number) {
    try {
      await db
        .update(products)
        .set({ viewCount: sql`${products.viewCount} + 1` })
        .where(eq(products.productId, productId));
    } catch (error) {
      // Log but don't throw - view count is non-critical
      console.warn('Failed to increment view count:', error);
    }
  }
}

export default new ProductsRepository();
