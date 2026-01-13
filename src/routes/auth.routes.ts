import { Router } from 'express';
import authController from '@/controllers/auth.controller';

const router = Router();

/**
 * Authentication Routes
 */

router.post('/register/email', authController.registerEmail);
router.post('/register/phone', authController.registerPhone);
router.post('/verify-otp', authController.verifyOtp);
router.post('/resend-otp', authController.resendOtp);
router.post('/login/email', authController.loginEmail);
router.post('/login/phone', authController.loginPhone);
router.post('/logout', authController.logout);

export default router;
