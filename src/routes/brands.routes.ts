import { Router } from 'express';
import brandsController from '@/controllers/brands.controller';

const router = Router();

/**
 * Brands Routes
 */

router.get('/', brandsController.getBrands);
router.get('/:id', brandsController.getBrandById);

export default router;
