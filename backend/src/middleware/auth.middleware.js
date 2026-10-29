import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { User } from '../models/User.js';
import { Merchant } from '../models/Merchant.js';

export const protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access denied. No active authentication session.'
        }
      });
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    // Support Merchant Portal Tenant Login
    if (decoded.role === 'MERCHANT' || decoded.role === 'merchant' || decoded.merchantId) {
      const merchant = await Merchant.findById(decoded.merchantId || decoded.id);
      if (!merchant || merchant.status !== 'Active') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'MERCHANT_INACTIVE',
            message: 'Merchant account is suspended or invalid.'
          }
        });
      }
      req.merchant = merchant;
      req.user = {
        _id: merchant._id,
        name: merchant.merchantName,
        email: merchant.loginEmail,
        role: 'merchant',
        permissions: merchant.permissions,
        storeDetails: merchant.storeDetails,
        linkToTeam: merchant.linkToTeam
      };
      return next();
    }

    // Support Staff User Login
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User account is invalid or deactivated.'
        }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_INVALID',
        message: 'Invalid or expired authentication session.'
      }
    });
  }
};

/**
 * Middleware to enforce any of the 12 merchant permissions
 */
export const requireMerchantPermission = (permissionKey) => {
  return (req, res, next) => {
    // If request is from internal staff (admin, manager, dispatcher), allow
    if (req.user && ['superadmin', 'admin', 'manager', 'dispatcher'].includes(req.user.role)) {
      return next();
    }

    if (!req.merchant) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Merchant authorization required.' }
      });
    }

    if (req.merchant.permissions && req.merchant.permissions[permissionKey] === false) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: `Merchant does not have permission to perform '${permissionKey}'.`
        }
      });
    }

    next();
  };
};
