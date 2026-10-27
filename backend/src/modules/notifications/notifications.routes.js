import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from './notifications.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

export default router;
