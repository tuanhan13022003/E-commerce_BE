/**
 * Products Service
 * Uses repository pattern for database abstraction
 * Handles business logic, formatting, and aggregation
 */

import { AppError } from '@/middlewares/error.middleware';
import { getProductsQuerySchema } from '@/validators/products.validator';
import { z } from 'zod';
import productsRepository, { ProductFilters } from '@/repositories/products.repository';

class ProductsService {
  /**
   * Constructor - inject repository
   * Dependency Injection: makes service testable
   */
  constructor(private productsRepo = productsRepository) {}

  /**
   * Get products with filters, pagination, and sorting
   */
  async getProducts(query: z.infer<typeof getProductsQuerySchema>) {
    const {
      page,
      pageSize,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      minRating,
      sortBy,
      sortOrder,
      search,
      isFeatured,
      isNew,
      isBestseller,
      isActive
    } = query;

    // Build filter object
    const filters: ProductFilters = {
      page,
      pageSize,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      minRating,
      sortBy,
      sortOrder,
      search,
      isFeatured,
      isNew,
      isBestseller,
      isActive
    };

    // Get products from repository
    const { products: productsData, totalCount } = await this.productsRepo.getProducts(filters);

    // Get primary images for paginated products (single batch query)
    const productIds = productsData.map(p => p.productId);
    const images = await this.productsRepo.getImagesByProductIds(productIds);
    const imageMap = new Map(images.map(img => [img.productId, img.imageUrl]));

    // Format response
    const formattedProducts = productsData.map(product => ({
      productId: product.productId,
      productName: product.productName,
      slug: product.slug,
      shortDescription: product.shortDescription,
      originalPrice: Number(product.originalPrice),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      finalPrice: product.salePrice ? Number(product.salePrice) : Number(product.originalPrice),
      discountPercent: product.discountPercent,
      stockQuantity: product.stockQuantity,
      soldQuantity: product.soldQuantity,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      isBestseller: product.isBestseller,
      averageRating: Number(product.averageRating),
      totalReviews: Number(product.totalReviews),
      primaryImage: imageMap.get(product.productId) || null,
      category: product.category,
      brand: product.brand,
      createdAt: product.createdAt
    }));

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          page,
          pageSize,
          totalItems: totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        filters: {
          categoryId,
          brandId,
          minPrice,
          maxPrice,
          minRating,
          search,
          isFeatured,
          isNew,
          isBestseller
        }
      }
    };
  }

  /**
   * Get product detail by ID or slug
   */
  async getProductDetail(identifier: string) {
    const product = await this.productsRepo.getProductDetail(identifier);

    if (!product) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
    }

    // Get all images for this product
    const images = await this.productsRepo.getProductImages(product.productId);

    // Fire-and-forget view count increment
    this.productsRepo.incrementViewCount(product.productId);

    return {
      success: true,
      data: {
        productId: product.productId,
        productName: product.productName,
        slug: product.slug,
        sku: product.sku,
        description: product.description,
        shortDescription: product.shortDescription,
        originalPrice: Number(product.originalPrice),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
        finalPrice: product.salePrice ? Number(product.salePrice) : Number(product.originalPrice),
        discountPercent: product.discountPercent,
        stockQuantity: product.stockQuantity,
        soldQuantity: product.soldQuantity,
        viewCount: product.viewCount,
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        isBestseller: product.isBestseller,
        isActive: product.isActive,
        videoUrl: product.videoUrl,
        averageRating: Number(product.averageRating),
        totalReviews: Number(product.totalReviews),
        category: product.category,
        brand: product.brand,
        images: images.map(img => ({
          imageId: img.imageId,
          imageUrl: img.imageUrl,
          altText: img.altText,
          isPrimary: img.isPrimary,
          displayOrder: img.displayOrder
        })),
        createdAt: product.createdAt
      }
    };
  }
}

// Export singleton instance for backward compatibility
export default new ProductsService();

// Export factory for testing/DI
export const createProductsService = (repo = productsRepository) => new ProductsService(repo);
