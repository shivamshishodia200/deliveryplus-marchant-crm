import jwt from 'jsonwebtoken';
import { User } from '../../models/User.js';
import { ENV } from '../../config/env.js';
import { logAuditEvent } from '../../middleware/audit.middleware.js';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN
  });
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginHistory.push({
        ip: req.ip,
        userAgent: req.headers['user-agent'] || '',
        status: 'failed'
      });
      await user.save();

      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_SUSPENDED', message: 'Account is deactivated. Contact administrator.' }
      });
    }

    const token = generateToken(user._id);

    user.lastLogin = new Date();
    user.loginHistory.push({
      ip: req.ip,
      userAgent: req.headers['user-agent'] || '',
      status: 'success'
    });
    await user.save();

    await logAuditEvent({
      actor: user._id,
      action: 'AUTH_LOGIN',
      entityType: 'User',
      entityId: user._id,
      details: { email: user.email, role: user.role },
      ip: req.ip
    });

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      data: {
        token,
        user: userObj
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await logAuditEvent({
        actor: req.user._id,
        action: 'AUTH_LOGOUT',
        entityType: 'User',
        entityId: req.user._id,
        details: {},
        ip: req.ip
      });
    }

    res.clearCookie('access_token');
    res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' }
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_CURRENT_PASSWORD', message: 'Current password does not match.' }
      });
    }

    user.password = newPassword;
    await user.save();

    await logAuditEvent({
      actor: user._id,
      action: 'PASSWORD_CHANGED',
      entityType: 'User',
      entityId: user._id,
      details: {},
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      data: { message: 'Password updated successfully.' }
    });
  } catch (error) {
    next(error);
  }
};
