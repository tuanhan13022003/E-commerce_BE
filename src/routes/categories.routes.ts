import { Router } from 'express';
import categoriesController from '@/controllers/categories.controller';

const router = Router();

/**
 * Categories Routes
 */

router.get('/', categoriesController.getCategories);
router.get('/:id', categoriesController.getCategoryById);

export default router;
