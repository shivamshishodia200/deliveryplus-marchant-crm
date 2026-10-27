import { Router } from 'express';
import {
  getQuotations,
  getQuotationById,
  createQuotation,
  updateQuotationStatus
} from './quotations.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/', getQuotations);
router.post('/', createQuotation);
router.get('/:id', getQuotationById);
router.patch('/:id/status', updateQuotationStatus);

export default router;
