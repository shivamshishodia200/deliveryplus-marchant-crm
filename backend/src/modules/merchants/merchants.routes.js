import { Router } from 'express';
import { merchantsController } from './merchants.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

// Public portal login for merchants
router.post('/portal/login', merchantsController.portalLogin);

// Portal Task routes (Scoped to authenticated merchant tenant)
router.get('/portal/tasks', protect, merchantsController.portalGetTasks);
router.post('/portal/tasks', protect, merchantsController.portalCreateTask);
router.delete('/portal/tasks/:id', protect, merchantsController.portalCancelTask);
router.get('/portal/tasks/:id/label', protect, merchantsController.portalPrintLabel);

// Protected routes (Admin / Dispatcher / Authenticated staff)
router.get('/export/csv', protect, merchantsController.exportCsv);
router.get('/', protect, merchantsController.getAll);
router.get('/:id', protect, merchantsController.getById);
router.post('/', protect, merchantsController.create);
router.put('/:id', protect, merchantsController.update);
router.delete('/:id', protect, merchantsController.delete);

export default router;
