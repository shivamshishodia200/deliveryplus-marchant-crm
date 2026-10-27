import { Router } from 'express';
import { getContacts, getContactById, createContact, updateContact, deleteContact } from './contacts.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();

router.use(protect);
router.get('/', getContacts);
router.post('/', createContact);
router.get('/:id', getContactById);
router.put('/:id', updateContact);
router.delete('/:id', authorize('superadmin', 'admin', 'manager'), deleteContact);

export default router;
