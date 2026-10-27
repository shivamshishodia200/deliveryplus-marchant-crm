import { Router } from 'express';
import { getUsers, createUser, updateUser } from './users.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();

router.use(protect);
router.get('/', getUsers);
router.post('/', authorize('superadmin', 'admin'), createUser);
router.put('/:id', authorize('superadmin', 'admin'), updateUser);

export default router;
