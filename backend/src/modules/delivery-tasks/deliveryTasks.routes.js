import { Router } from 'express';
import { deliveryTasksController } from './deliveryTasks.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/dashboard', deliveryTasksController.getDashboardMetrics);
router.get('/export/csv', deliveryTasksController.exportCsv);
router.post('/bulk', deliveryTasksController.bulkActions);

router.get('/', deliveryTasksController.getAll);
router.get('/:id', deliveryTasksController.getById);
router.post('/', deliveryTasksController.create);
router.put('/:id', deliveryTasksController.update);
router.patch('/:id/status', deliveryTasksController.updateStatus);
router.post('/:id/assign', deliveryTasksController.assignDriver);

export default router;
