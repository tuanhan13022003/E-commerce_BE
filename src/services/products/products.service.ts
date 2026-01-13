import { db } from '@/config/database';
import { products, categories, brands, productImages, productReviews } from '@/database/schema/products.schema';
import { eq, and, gte, lte, inArray, ilike, desc, asc, sql, isNull, or, isNotNull, is } from 'drizzle-orm';
import { AppError } from '@/middlewares/error.middleware';
import {getProductsQuerySchema} from '@/validators/products.validator';
import { z } from 'zod';

class ProductsService {
    // Get products with filters, pagination, and sorting
    async getProducts(query: z.infer<typeof getProductsQuerySchema>) {

        const{
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

        // Build conditions
        const conditions = [];

        //Active filter
        conditions.push(eq(products.isActive, isActive));

        // Category filter
        if(categoryId !== undefined){
            conditions.push(eq(products.categoryId, categoryId));
        }

        // Brand filter
        if(brandId !== undefined && brandId.length > 0){
            conditions.push(inArray(products.brandId, brandId));
        }
        
        // Price range filter
        if(minPrice !== undefined){
            conditions.push(
                or(
                    and(isNotNull(products.salePrice), gte(products.salePrice, minPrice.toString())),
          and(isNull(products.salePrice), gte(products.originalPrice, minPrice.toString()))
                )
            )
        }

        if(maxPrice !== undefined){
            conditions.push(
                or(
                    and(isNotNull(products.salePrice), lte(products.salePrice, maxPrice.toString())),
                    and(isNull(products.salePrice), lte(products.originalPrice, maxPrice.toString()))
                )
            )
        }

        // FEatureD, NEW, BESTSELLER filters
        if(isFeatured !== undefined){
            conditions.push(eq(products.isFeatured, isFeatured));
        }
        if(isNew !== undefined){
            conditions.push(eq(products.isNew, isNew));
        }
        if(isBestseller !== undefined){
            conditions.push(eq(products.isBestseller, isBestseller));
        }

        // Search filter
        if(search){
            conditions.push(ilike(products.productName, `%${search}%`));
        }
        
        // Build base query
        let orderBy;
        switch (sortBy) {
      case 'price':
        // Sort by sale_price if exists, otherwise original_price
        orderBy = sortOrder === 'asc' 
          ? asc(sql`COALESCE(${products.salePrice}, ${products.originalPrice})`)
          : desc(sql`COALESCE(${products.salePrice}, ${products.originalPrice})`);
        break;
      case 'rating':
        orderBy = sortOrder === 'asc' 
          ? asc(sql`COALESCE((SELECT AVG(rating) FROM product_reviews WHERE product_id = ${products.productId} AND is_approved = true), 0)`)
          : desc(sql`COALESCE((SELECT AVG(rating) FROM product_reviews WHERE product_id = ${products.productId} AND is_approved = true), 0)`);
        break;
      case 'popular':
        orderBy = desc(products.soldQuantity);
        break;
      case 'discount':
        orderBy = desc(products.discountPercent);
        break;
      case 'name':
        orderBy = sortOrder === 'asc' ? asc(products.productName) : desc(products.productName);
        break;
      case 'newest':
      default:
        orderBy = desc(products.createdAt);
        break;
    }

     // Calculate pagination
    const offset = (page - 1) * pageSize;

    // Execute query with joins and aggregated rating
    const [productsData, totalCountResult] = await Promise.all([
      // Get products with category, brand, and rating info
      db
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
          // Aggregate rating and review count
          averageRating: sql<number>`COALESCE((SELECT AVG(rating) FROM product_reviews WHERE product_id = ${products.productId} AND is_approved = true), 0)`,
          totalReviews: sql<number>`COALESCE((SELECT COUNT(*) FROM product_reviews WHERE product_id = ${products.productId} AND is_approved = true), 0)`
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.categoryId))
        .leftJoin(brands, eq(products.brandId, brands.brandId))
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(pageSize)
        .offset(offset),

      // Get total count for pagination
      db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(and(...conditions))
    ]);

    // Filter by minRating if specified (after aggregation)
    let filteredProducts = productsData;
    if (minRating !== undefined) {
      filteredProducts = productsData.filter(p => Number(p.averageRating) >= minRating);
    }

       // Get primary images for all products
    const productIds = filteredProducts.map(p => p.productId);
    const images = productIds.length > 0 
      ? await db
          .select()
          .from(productImages)
          .where(
            and(
              inArray(productImages.productId, productIds),
              eq(productImages.isPrimary, true)
            )
          )
      : [];

    // Map images to products
    const imageMap = new Map(images.map(img => [img.productId, img.imageUrl]));

    // Format response
    const formattedProducts = filteredProducts.map(product => ({
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

    const totalCount = totalCountResult[0]?.count || 0;
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

   // Get product detail by ID or slug
  async getProductDetail(identifier: string) {
    // Check if identifier is number (ID) or slug
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
        averageRating: sql<number>`COALESCE((SELECT AVG(rating) FROM product_reviews WHERE product_id = ${products.productId} AND is_approved = true), 0)`,
        totalReviews: sql<number>`COALESCE((SELECT COUNT(*) FROM product_reviews WHERE product_id = ${products.productId} AND is_approved = true), 0)`
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.categoryId))
      .leftJoin(brands, eq(products.brandId, brands.brandId))
      .where(condition)
      .limit(1);

    if (!product) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
    }

    // Get all images for this product
    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, product.productId))
      .orderBy(asc(productImages.displayOrder));

    // Update view count
    await db
      .update(products)
      .set({ viewCount: sql`${products.viewCount} + 1` })
      .where(eq(products.productId, product.productId));

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

export default new ProductsService();




