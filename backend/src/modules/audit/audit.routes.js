import { Router } from 'express';
import { getAuditLogs } from './audit.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();

router.use(protect);
router.get('/', authorize('superadmin', 'admin'), getAuditLogs);

export default router;
