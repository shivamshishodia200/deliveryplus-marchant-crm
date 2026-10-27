import { Router } from 'express';
import { getLeads, getLeadById, createLead, updateLead, convertLead, deleteLead } from './leads.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createLeadSchema } from './leads.validator.js';

const router = Router();

router.use(protect);
router.get('/', getLeads);
router.post('/', validate(createLeadSchema), createLead);
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.post('/:id/convert', convertLead);
router.delete('/:id', authorize('superadmin', 'admin', 'manager'), deleteLead);

export default router;
