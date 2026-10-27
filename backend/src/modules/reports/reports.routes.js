import { Router } from 'express';
import { getDashboardMetrics, exportData } from './reports.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();

router.use(protect);
router.get('/dashboard', getDashboardMetrics);
router.get('/export', authorize('superadmin', 'admin', 'manager'), exportData);

export default router;
