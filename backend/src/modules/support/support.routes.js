import { Router } from 'express';
import {
  getTickets,
  getTicketById,
  createTicket,
  addTicketComment,
  updateTicketStatus
} from './support.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/', getTickets);
router.post('/', createTicket);
router.get('/:id', getTicketById);
router.post('/:id/comments', addTicketComment);
router.patch('/:id/status', updateTicketStatus);

export default router;
