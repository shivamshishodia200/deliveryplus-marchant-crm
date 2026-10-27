import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask } from './tasks.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
