import { Router } from 'express';
import { getSettings, updateSettings } from './settings.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();

router.use(protect);
router.get('/', getSettings);
router.put('/', authorize('superadmin', 'admin'), updateSettings);

export default router;
