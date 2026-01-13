import { Router } from 'express';
import productsController from '@/controllers/products.controller';

const router = Router();

/**
 * Products Routes
 */

router.get('/', productsController.getProducts);
router.get('/:identifier', productsController.getProductDetail);

export default router;
