import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/deliveryplus_crm',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_development_secret_key_change_in_prod',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'cookie_secret_fallback'
};
