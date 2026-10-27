import { Router } from 'express';
import { merchantsController } from './merchants.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

// Public portal login for merchants
router.post('/portal/login', merchantsController.portalLogin);

// Protected routes (Admin / Dispatcher / Authenticated staff)
router.get('/export/csv', protect, merchantsController.exportCsv);
router.get('/', protect, merchantsController.getAll);
router.get('/:id', protect, merchantsController.getById);
router.post('/', protect, merchantsController.create);
router.put('/:id', protect, merchantsController.update);
router.delete('/:id', protect, merchantsController.delete);

export default router;
