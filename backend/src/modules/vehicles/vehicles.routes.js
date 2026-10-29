import { Router } from 'express';
import { vehiclesController } from './vehicles.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/', vehiclesController.getAll);
router.post('/', vehiclesController.create);
router.put('/:id', vehiclesController.update);

export default router;
