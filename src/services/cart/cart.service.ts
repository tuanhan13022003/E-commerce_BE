import { db } from '@/config/database';
import { carts, cartItems } from '@/database/schema/carts.schema';
import { products } from '@/database/schema/products.schema';
import { eq, and, ilike, asc, desc, lte, gte } from 'drizzle-orm';
import { AppError } from '@/middlewares/error.middleware';
import { AddToCartInput, UpdateCartItemInput, GetCartQuery } from '@/validators/cart.validator';

class CartService {
  /**
   * Get user's cart with all items and calculated totals, with filtering and pagination
   */
  async getCart(userId: number, query?: GetCartQuery) {
    const {
      page = 1,
      pageSize = 10,
      search,
      sortBy = 'newest',
      sortOrder = 'desc',
      minPrice,
      maxPrice,
    } = query || {};

    // Find user's cart
    const userCart = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId))
      .limit(1);

    if (userCart.length === 0) {
      // Create empty cart response if doesn't exist
      return {
        success: true,
        data: {
          cartId: null,
          items: [],
          totalItems: 0,
          totalAmount: 0,
          pagination: {
            page,
            pageSize,
            total: 0,
            totalPages: 0,
          },
        },
      };
    }

    const cartId = userCart[0].cartId;

    // Build filter conditions
    const conditions = [eq(cartItems.cartId, cartId)];

    // Search filter
    if (search) {
      conditions.push(ilike(products.productName, `%${search}%`));
    }

    // Price filters
    if (minPrice !== undefined) {
      conditions.push(gte(cartItems.price, minPrice.toString()));
    }
    if (maxPrice !== undefined) {
      conditions.push(lte(cartItems.price, maxPrice.toString()));
    }

    // Build sort order
    let orderBy;
    switch (sortBy) {
      case 'price':
        orderBy = sortOrder === 'asc' ? asc(cartItems.price) : desc(cartItems.price);
        break;
      case 'quantity':
        orderBy = sortOrder === 'asc' ? asc(cartItems.quantity) : desc(cartItems.quantity);
        break;
      case 'oldest':
        orderBy = asc(cartItems.addedAt);
        break;
      case 'newest':
      default:
        orderBy = desc(cartItems.addedAt);
        break;
    }

    // Get total count
    const allItems = await db
      .select({
        cartItemId: cartItems.cartItemId,
        productId: cartItems.productId,
        productName: products.productName,
        slug: products.slug,
        quantity: cartItems.quantity,
        price: cartItems.price,
        stockQuantity: products.stockQuantity,
        isActive: products.isActive,
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.productId))
      .where(and(...conditions));

    const totalCount = allItems.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Calculate pagination
    const offset = (page - 1) * pageSize;

    // Get paginated items
    const items = await db
      .select({
        cartItemId: cartItems.cartItemId,
        productId: cartItems.productId,
        productName: products.productName,
        slug: products.slug,
        quantity: cartItems.quantity,
        price: cartItems.price,
        stockQuantity: products.stockQuantity,
        isActive: products.isActive,
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.productId))
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(pageSize)
      .offset(offset);

    // Calculate totals
    let totalItems = 0;
    let totalAmount = 0;

    const itemsWithSubtotal = items.map((item) => {
      const subtotal = Number(item.price) * item.quantity;
      totalItems += item.quantity;
      totalAmount += subtotal;
      return {
        cartItemId: item.cartItemId,
        productId: item.productId,
        productName: item.productName,
        slug: item.slug,
        quantity: item.quantity,
        price: Number(item.price),
        subtotal,
      };
    });

    return {
      success: true,
      data: {
        cartId,
        items: itemsWithSubtotal,
        totalItems,
        totalAmount,
        pagination: {
          page,
          pageSize,
          total: totalCount,
          totalPages,
        },
      },
    };
  }

  /**
   * Add item to cart (upsert if product already exists)
   */
  async addItem(userId: number, input: AddToCartInput) {
    const { productId, quantity } = input;

    // Check if product exists and is active
    const product = await db
      .select()
      .from(products)
      .where(eq(products.productId, productId))
      .limit(1);

    if (product.length === 0) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
    }

    const productData = product[0];

    if (!productData.isActive) {
      throw new AppError(400, 'PRODUCT_UNAVAILABLE', 'Product is not available');
    }

    // Check stock
    if ((productData.stockQuantity ?? 0) < quantity) {
      throw new AppError(400, 'INSUFFICIENT_STOCK', 'Insufficient stock available');
    }

    // Get effective price (sale_price if exists, else original_price)
    const effectivePrice = productData.salePrice || productData.originalPrice;

    // Find or create user's cart
    let userCart = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId))
      .limit(1);

    if (userCart.length === 0) {
      const newCart = await db
        .insert(carts)
        .values({ userId })
        .returning();
      userCart = newCart;
    }

    const cartId = userCart[0].cartId;

    // Check if product already in cart
    const existingItem = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cartId),
          eq(cartItems.productId, productId)
        )
      )
      .limit(1);

    if (existingItem.length > 0) {
      // Update quantity
      const newQuantity = existingItem[0].quantity + quantity;
      if ((productData.stockQuantity ?? 0) < newQuantity) {
        throw new AppError(400, 'INSUFFICIENT_STOCK', 'Insufficient stock available for requested quantity');
      }
      await db
        .update(cartItems)
        .set({ quantity: newQuantity })
        .where(eq(cartItems.cartItemId, existingItem[0].cartItemId));
    } else {
      // Add new item
      await db
        .insert(cartItems)
        .values({
          cartId,
          productId,
          quantity,
          price: effectivePrice,
        });
    }

    return await this.getCart(userId);
  }

  /**
   * Update quantity of item in cart
   */
  async updateItem(userId: number, cartItemId: number, input: UpdateCartItemInput) {
    const { quantity } = input;

    // Get cart item and verify it belongs to user
    const cartItem = await db
      .select()
      .from(cartItems)
      .leftJoin(carts, eq(cartItems.cartId, carts.cartId))
      .where(
        and(
          eq(cartItems.cartItemId, cartItemId),
          eq(carts.userId, userId)
        )
      )
      .limit(1);

    if (cartItem.length === 0) {
      throw new AppError(404, 'ITEM_NOT_IN_CART', 'Item not found in your cart');
    }

    // Check product stock
    const product = await db
      .select()
      .from(products)
      .where(eq(products.productId, cartItem[0].cart_items.productId))
      .limit(1);

    if (product.length === 0) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
    }

    if ((product[0].stockQuantity ?? 0) < quantity) {
      throw new AppError(400, 'INSUFFICIENT_STOCK', 'Insufficient stock available');
    }

    // Update quantity
    await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.cartItemId, cartItemId));

    return await this.getCart(userId);
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId: number, cartItemId: number) {
    // Verify item belongs to user's cart
    const cartItem = await db
      .select()
      .from(cartItems)
      .leftJoin(carts, eq(cartItems.cartId, carts.cartId))
      .where(
        and(
          eq(cartItems.cartItemId, cartItemId),
          eq(carts.userId, userId)
        )
      )
      .limit(1);

    if (cartItem.length === 0) {
      throw new AppError(404, 'ITEM_NOT_IN_CART', 'Item not found in your cart');
    }

    // Delete item
    await db.delete(cartItems).where(eq(cartItems.cartItemId, cartItemId));

    return await this.getCart(userId);
  }

  /**
   * Clear entire cart (delete all items)
   */
  async clearCart(userId: number) {
    // Get user's cart
    const userCart = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId))
      .limit(1);

    if (userCart.length === 0) {
      // Cart doesn't exist, return empty cart
      return {
        success: true,
        message: 'Cart cleared',
        data: {
          cartId: null,
          items: [],
          totalItems: 0,
          totalAmount: 0,
        },
      };
    }

    const cartId = userCart[0].cartId;

    // Delete all items in cart
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));

    return {
      success: true,
      message: 'Cart cleared',
      data: {
        cartId,
        items: [],
        totalItems: 0,
        totalAmount: 0,
      },
    };
  }
}

export default new CartService();
