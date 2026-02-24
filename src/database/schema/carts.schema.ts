import { pgTable, serial, integer, decimal, timestamp, index, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { products } from './products.schema';

// Carts table - from ScriptDb.sql
export const carts = pgTable('carts', {
  cartId: serial('cart_id').primaryKey(),
  userId: integer('user_id').references(() => users.userId, { onDelete: 'cascade' }),
  sessionId: varchar('session_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_carts_user_id').on(table.userId),
  sessionIdIdx: index('idx_carts_session_id').on(table.sessionId),
}));

// Cart items table - from ScriptDb.sql
export const cartItems = pgTable('cart_items', {
  cartItemId: serial('cart_item_id').primaryKey(),
  cartId: integer('cart_id').notNull().references(() => carts.cartId, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.productId, { onDelete: 'cascade' }),
  variantId: integer('variant_id'), // FK to product_variants (optional, not yet in schema)
  quantity: integer('quantity').notNull().default(1),
  price: decimal('price', { precision: 15, scale: 2 }).notNull(),
  addedAt: timestamp('added_at').defaultNow(),
}, (table) => ({
  cartIdIdx: index('idx_cart_items_cart_id').on(table.cartId),
  productIdIdx: index('idx_cart_items_product_id').on(table.productId),
}));

// Relations
export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.userId],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.cartId],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.productId],
  }),
}));

// Types
export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
