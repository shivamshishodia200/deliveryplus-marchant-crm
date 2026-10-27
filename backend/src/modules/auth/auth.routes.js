import { Router } from 'express';
import { login, getMe, logout, updatePassword } from './auth.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { loginSchema, updatePasswordSchema } from './auth.validator.js';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/update-password', protect, validate(updatePasswordSchema), updatePassword);

export default router;
