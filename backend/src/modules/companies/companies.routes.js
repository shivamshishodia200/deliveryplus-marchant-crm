import { Router } from 'express';
import { getCompanies, getCompanyById, createCompany, updateCompany, deleteCompany } from './companies.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();

router.use(protect);
router.get('/', getCompanies);
router.post('/', createCompany);
router.get('/:id', getCompanyById);
router.put('/:id', updateCompany);
router.delete('/:id', authorize('superadmin', 'admin', 'manager'), deleteCompany);

export default router;
