import { pgTable, serial, integer, varchar, text, decimal, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

//Categories Table

export const categories = pgTable('categories', {
  categoryId: serial('category_id').primaryKey(),
  parentId: integer('parent_id').references((): any => categories.categoryId),
  categoryName: varchar('category_name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: varchar('description', { length: 1000 }),
  imageUrl: varchar('image_url', { length: 500 }),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: varchar('meta_description', { length: 500 }),
  metaKeywords: varchar('meta_keywords', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  parentIdIdx: index('idx_categories_parent_id').on(table.parentId),
  isActiveIdx: index('idx_categories_is_active').on(table.isActive),
  displayOrderIdx: index('idx_categories_display_order').on(table.displayOrder)
}));

//Brands table
export const brands = pgTable('brands', {
    brandId: serial('brand_id').primaryKey(),
    brandName: varchar('brand_name', {length: 255}).notNull(),
    slug: varchar('slug', {length: 255}).notNull().unique(),
    description: varchar('description', {length: 1000}),
    logoUrl: varchar('logo_url', {length: 500}),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
    isActiveIdx: index('idx_brands_is_active').on(table.isActive)
}));

// Products table
export const products = pgTable('products', {
  productId: serial('product_id').primaryKey(),
  categoryId: integer('category_id').notNull().references(() => categories.categoryId),
  brandId: integer('brand_id').references(() => brands.brandId),
  productName: varchar('product_name', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 500 }).notNull().unique(),
  sku: varchar('sku', { length: 100 }).unique(),
  description: text('description'),
  shortDescription: varchar('short_description', { length: 1000 }),
  originalPrice: decimal('original_price', { precision: 15, scale: 2 }).notNull(),
  salePrice: decimal('sale_price', { precision: 15, scale: 2 }),
  discountPercent: integer('discount_percent').default(0),
  stockQuantity: integer('stock_quantity').default(0),
  soldQuantity: integer('sold_quantity').default(0),
  viewCount: integer('view_count').default(0),
  isFeatured: boolean('is_featured').default(false),
  isNew: boolean('is_new').default(false),
  isBestseller: boolean('is_bestseller').default(false),
  isActive: boolean('is_active').default(true),
  videoUrl: varchar('video_url', { length: 500 }),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: varchar('meta_description', { length: 500 }),
  metaKeywords: varchar('meta_keywords', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  categoryIdIdx: index('idx_products_category_id').on(table.categoryId),
  brandIdIdx: index('idx_products_brand_id').on(table.brandId),
  isActiveIdx: index('idx_products_is_active').on(table.isActive),
  isFeaturedIdx: index('idx_products_is_featured').on(table.isFeatured),
  isNewIdx: index('idx_products_is_new').on(table.isNew),
  isBestsellerIdx: index('idx_products_is_bestseller').on(table.isBestseller),
  salePriceIdx: index('idx_products_sale_price').on(table.salePrice),
  createdAtIdx: index('idx_products_created_at').on(table.createdAt)
}));

export const productImages = pgTable('product_images', {
  imageId: serial('image_id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.productId, { onDelete: 'cascade' }),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  altText: varchar('alt_text', { length: 255 }),
  displayOrder: integer('display_order').default(0),
  isPrimary: boolean('is_primary').default(false),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  productIdIdx: index('idx_product_images_product_id').on(table.productId),
  isPrimaryIdx: index('idx_product_images_is_primary').on(table.isPrimary)
}));

// Product Reviews table (để tính average rating)
export const productReviews = pgTable('product_reviews', {
  reviewId: serial('review_id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.productId, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull(),
  orderId: integer('order_id'),
  rating: integer('rating').notNull(),
  title: varchar('title', { length: 255 }),
  comment: text('comment'),
  isApproved: boolean('is_approved').default(false),
  isVerifiedPurchase: boolean('is_verified_purchase').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  productIdIdx: index('idx_product_reviews_product_id').on(table.productId),
  ratingIdx: index('idx_product_reviews_rating').on(table.rating),
  isApprovedIdx: index('idx_product_reviews_is_approved').on(table.isApproved)
}));

// Relations
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.categoryId]
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.brandId]
  }),
  images: many(productImages),
  reviews: many(productReviews)
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products)
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products)
}));