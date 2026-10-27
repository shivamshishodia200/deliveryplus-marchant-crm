import { Router } from 'express';
import { getActivities, createActivity } from './activities.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/', getActivities);
router.post('/', createActivity);

export default router;
