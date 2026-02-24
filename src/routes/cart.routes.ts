import { Router } from 'express';
import cartController from '@/controllers/cart.controller';
import { requireAuth } from '@/middlewares/auth.middleware';

const router = Router();

/**
 * Cart Routes (Protected - require authentication)
 */

// Get user's cart
router.get('/', requireAuth, cartController.getCart);

// Add item to cart
router.post('/items', requireAuth, cartController.addItem);

// Update item quantity in cart
router.patch('/items/:cartItemId', requireAuth, cartController.updateItem);

// Remove item from cart
router.delete('/items/:cartItemId', requireAuth, cartController.removeItem);

// Clear entire cart
router.delete('/', requireAuth, cartController.clearCart);

export default router;
