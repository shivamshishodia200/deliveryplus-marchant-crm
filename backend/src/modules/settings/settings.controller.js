import { Setting } from '../../models/Setting.js';
import { logAuditEvent } from '../../middleware/audit.middleware.js';

export const getSettings = async (req, res, next) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
    }

    res.status(200).json({
      success: true,
      data: setting
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create(req.body);
    } else {
      Object.assign(setting, req.body);
      await setting.save();
    }

    await logAuditEvent({
      actor: req.user._id,
      action: 'ORGANIZATION_SETTINGS_UPDATED',
      entityType: 'Setting',
      entityId: setting._id,
      details: req.body,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      data: setting
    });
  } catch (error) {
    next(error);
  }
};
