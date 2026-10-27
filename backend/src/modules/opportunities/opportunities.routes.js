import { Router } from 'express';
import {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  updateOpportunityStage,
  deleteOpportunity
} from './opportunities.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();

router.use(protect);
router.get('/', getOpportunities);
router.post('/', createOpportunity);
router.get('/:id', getOpportunityById);
router.put('/:id', updateOpportunity);
router.patch('/:id/stage', updateOpportunityStage);
router.delete('/:id', authorize('superadmin', 'admin', 'manager'), deleteOpportunity);

export default router;
