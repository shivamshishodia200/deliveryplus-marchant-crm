import { Router } from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from './products.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();

router.use(protect);
router.get('/', getProducts);
router.post('/', authorize('superadmin', 'admin', 'manager'), createProduct);
router.put('/:id', authorize('superadmin', 'admin', 'manager'), updateProduct);
router.delete('/:id', authorize('superadmin', 'admin', 'manager'), deleteProduct);

export default router;
