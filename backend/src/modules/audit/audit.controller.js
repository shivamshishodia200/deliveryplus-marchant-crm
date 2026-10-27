import { AuditLog } from '../../models/AuditLog.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, entityType, page = 1, limit = 50 } = req.query;
    const query = {};

    if (action) query.action = action;
    if (entityType) query.entityType = entityType;

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('actor', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      AuditLog.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};
