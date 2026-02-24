import { Request, Response, NextFunction } from 'express';
import cartService from '@/services/cart/cart.service';
import { addToCartSchema, updateCartItemSchema, cartItemParamsSchema, getCartQuerySchema } from '@/validators/cart.validator';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string | null;
    phone: string | null;
    role: string;
  };
}

class CartController {
  /**
   * Get user's cart with filtering and pagination
   * GET /api/v1/cart
   */
  async getCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // #swagger.tags = ['Cart']
    // #swagger.summary = 'Get user cart'
    // #swagger.description = 'Retrieve the current user cart with items, totals, filtering, sorting and pagination'
    // #swagger.security = [{ "bearerAuth": [] }]
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const validatedQuery = getCartQuerySchema.parse(req.query);
      const result = await cartService.getCart(req.user.userId, validatedQuery);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add item to cart
   * POST /api/v1/cart/items
   */
  async addItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // #swagger.tags = ['Cart']
    // #swagger.summary = 'Add item to cart'
    // #swagger.description = 'Add a product to the cart or increase quantity if already exists'
    // #swagger.security = [{ "bearerAuth": [] }]
    /* #swagger.requestBody = {
      required: true,
      content: { "application/json": { schema: { $ref: '#/definitions/AddToCartRequest' }}}
    } */
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const validatedData = addToCartSchema.parse(req.body);
      const result = await cartService.addItem(req.user.userId, validatedData);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update cart item quantity
   * PATCH /api/v1/cart/items/:cartItemId
   */
  async updateItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // #swagger.tags = ['Cart']
    // #swagger.summary = 'Update item quantity'
    // #swagger.description = 'Update the quantity of an item in the cart'
    // #swagger.security = [{ "bearerAuth": [] }]
    /* #swagger.requestBody = {
      required: true,
      content: { "application/json": { schema: { $ref: '#/definitions/UpdateCartItemRequest' }}}
    } */
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const validatedParams = cartItemParamsSchema.parse(req.params);
      const validatedData = updateCartItemSchema.parse(req.body);
      const result = await cartService.updateItem(
        req.user.userId,
        validatedParams.cartItemId,
        validatedData
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove item from cart
   * DELETE /api/v1/cart/items/:cartItemId
   */
  async removeItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // #swagger.tags = ['Cart']
    // #swagger.summary = 'Remove item from cart'
    // #swagger.description = 'Remove a single item from the cart'
    // #swagger.security = [{ "bearerAuth": [] }]
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const validatedParams = cartItemParamsSchema.parse(req.params);
      const result = await cartService.removeItem(req.user.userId, validatedParams.cartItemId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clear entire cart
   * DELETE /api/v1/cart
   */
  async clearCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // #swagger.tags = ['Cart']
    // #swagger.summary = 'Clear cart'
    // #swagger.description = 'Remove all items from the cart'
    // #swagger.security = [{ "bearerAuth": [] }]
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const result = await cartService.clearCart(req.user.userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new CartController();
