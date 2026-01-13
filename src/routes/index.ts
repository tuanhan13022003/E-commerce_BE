import { Router } from 'express';
import authRoutes from './auth.routes';
import productsRoutes from './products.routes';
import categoriesRoutes from './categories.routes';
import brandsRoutes from './brands.routes';

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
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/brands', brandsRoutes);
// TODO: Add other routes
// router.use('/cart', cartRoutes);
// router.use('/orders', ordersRoutes);
// router.use('/admin', adminRoutes);

export default router;
