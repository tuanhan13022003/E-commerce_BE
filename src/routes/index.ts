import { Router } from 'express';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import productsRoutes from './products.routes';
import categoriesRoutes from './categories.routes';
import brandsRoutes from './brands.routes';
import cartRoutes from './cart.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/brands', brandsRoutes);
router.use('/cart', cartRoutes);
// TODO: Add other routes
// router.use('/orders', ordersRoutes);
// router.use('/admin', adminRoutes);

export default router;
