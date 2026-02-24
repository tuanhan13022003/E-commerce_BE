import { Router } from 'express';
import profileController from '@/controllers/profile.controller';
import { requireAuth } from '@/middlewares/auth.middleware';

const router = Router();

/**
 * Profile Routes (Protected - require authentication)
 */

// Get current user profile
router.get('/', requireAuth, profileController.getProfile);

// Update user profile
router.patch('/', requireAuth, profileController.updateProfile);

export default router;
