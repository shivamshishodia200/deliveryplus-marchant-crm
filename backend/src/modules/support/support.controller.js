import { SupportTicket } from '../../models/SupportTicket.js';
import { logAuditEvent } from '../../middleware/audit.middleware.js';

export const getTickets = async (req, res, next) => {
  try {
    const { status, priority, category, assignedTo } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (assignedTo) query.assignedTo = assignedTo;

    const tickets = await SupportTicket.find(query)
      .populate('company', 'name')
      .populate('contact', 'firstName lastName email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tickets,
      meta: { total: tickets.length }
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketById = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('company')
      .populate('contact')
      .populate('assignedTo', 'name email')
      .populate('comments.author', 'name email avatar role');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Ticket not found' }
      });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

export const createTicket = async (req, res, next) => {
  try {
    const count = await SupportTicket.countDocuments();
    const ticketNumber = `TCK-${String(count + 1001).padStart(5, '0')}`;

    const ticket = await SupportTicket.create({
      ...req.body,
      ticketNumber,
      assignedTo: req.body.assignedTo || req.user._id
    });

    await logAuditEvent({
      actor: req.user._id,
      action: 'TICKET_CREATED',
      entityType: 'SupportTicket',
      entityId: ticket._id,
      details: { ticketNumber, subject: ticket.subject },
      ip: req.ip
    });

    const populated = await SupportTicket.findById(ticket._id)
      .populate('company', 'name')
      .populate('assignedTo', 'name');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

export const addTicketComment = async (req, res, next) => {
  try {
    const { body, isInternal } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Ticket not found' }
      });
    }

    ticket.comments.push({
      author: req.user._id,
      body,
      isInternal: Boolean(isInternal),
      createdAt: new Date()
    });

    if (ticket.status === 'open') {
      ticket.status = 'in_progress';
    }

    await ticket.save();

    const populated = await SupportTicket.findById(ticket._id)
      .populate('comments.author', 'name email avatar role');

    res.status(200).json({
      success: true,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

export const updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Ticket not found' }
      });
    }

    ticket.status = status;
    if (status === 'resolved' || status === 'closed') {
      ticket.resolvedAt = new Date();
    }

    await ticket.save();

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};
