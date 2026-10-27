import { User } from '../../models/User.js';
import { logAuditEvent } from '../../middleware/audit.middleware.js';

export const getUsers = async (req, res, next) => {
  try {
    const { role, department, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users,
      meta: { total: users.length }
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'User with this email already exists' }
      });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'DeliveryPlus2026!',
      role: role || 'sales_rep',
      department: department || 'Sales',
      phone: phone || ''
    });

    await logAuditEvent({
      actor: req.user._id,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: user._id,
      details: { email: user.email, role: user.role },
      ip: req.ip
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      data: userObj
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { name, role, department, phone, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' }
      });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (department) user.department = department;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    await logAuditEvent({
      actor: req.user._id,
      action: 'USER_UPDATED',
      entityType: 'User',
      entityId: user._id,
      details: { role: user.role, isActive: user.isActive },
      ip: req.ip
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      data: userObj
    });
  } catch (error) {
    next(error);
  }
};
