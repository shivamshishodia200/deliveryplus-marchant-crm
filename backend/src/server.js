import app from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';
import { logger } from './config/logger.js';

let server;

const startServer = async () => {
  await connectDB();

  server = app.listen(ENV.PORT, () => {
    logger.info(`====================================================`);
    logger.info(`🚀 DeliveryPlus Enterprise CRM API running on port ${ENV.PORT}`);
    logger.info(`📖 OpenAPI Docs available at http://localhost:${ENV.PORT}/api/v1/docs`);
    logger.info(`⚡ Health Check available at http://localhost:${ENV.PORT}/api/v1/health`);
    logger.info(`====================================================`);
  });
};

const handleShutdown = async (signal) => {
  logger.info(`Received ${signal}. Gracefully terminating server...`);
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

startServer();
