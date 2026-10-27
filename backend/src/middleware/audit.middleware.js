import { AuditLog } from '../models/AuditLog.js';
import { logger } from '../config/logger.js';

export const logAuditEvent = async ({ actor, action, entityType, entityId, details, ip }) => {
  try {
    await AuditLog.create({
      actor: actor?._id || actor || null,
      action,
      entityType,
      entityId,
      details,
      ip: ip || ''
    });
  } catch (error) {
    logger.error('Failed to log audit event:', error);
  }
};
