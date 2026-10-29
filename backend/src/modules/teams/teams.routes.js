import { Router } from 'express';
import { teamsController } from './teams.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/', teamsController.getAll);
router.post('/', teamsController.create);

export default router;
