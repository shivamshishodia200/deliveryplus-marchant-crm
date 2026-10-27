import { logger } from '../config/logger.js';
import { ENV } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} - Error: ${err.message}`, err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred.';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'DATABASE_VALIDATION_ERROR';
  } else if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY_ERROR';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists.`;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_RESOURCE_ID';
    message = 'Resource not found with specified identifier.';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(ENV.NODE_ENV === 'development' ? { stack: err.stack } : {})
    }
  });
};
