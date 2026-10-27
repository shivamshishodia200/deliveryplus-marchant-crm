import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { ENV } from './config/env.js';
import { swaggerDocument } from './config/swagger.js';
import { errorHandler } from './middleware/error.middleware.js';

import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import leadsRoutes from './modules/leads/leads.routes.js';
import contactsRoutes from './modules/contacts/contacts.routes.js';
import companiesRoutes from './modules/companies/companies.routes.js';
import opportunitiesRoutes from './modules/opportunities/opportunities.routes.js';
import activitiesRoutes from './modules/activities/activities.routes.js';
import tasksRoutes from './modules/tasks/tasks.routes.js';
import productsRoutes from './modules/products/products.routes.js';
import quotationsRoutes from './modules/quotations/quotations.routes.js';
import supportRoutes from './modules/support/support.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';
import settingsRoutes from './modules/settings/settings.routes.js';
import merchantsRoutes from './modules/merchants/merchants.routes.js';

const app = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false // Allow Swagger UI and API assets in dev
  })
);

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);

// Cookie & Body Parsing
app.use(cookieParser(ENV.COOKIE_SECRET));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Swagger Interactive API Docs
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Mount modular API v1 routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/leads', leadsRoutes);
app.use('/api/v1/contacts', contactsRoutes);
app.use('/api/v1/companies', companiesRoutes);
app.use('/api/v1/opportunities', opportunitiesRoutes);
app.use('/api/v1/activities', activitiesRoutes);
app.use('/api/v1/tasks', tasksRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/quotations', quotationsRoutes);
app.use('/api/v1/tickets', supportRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/merchants', merchantsRoutes);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Endpoint ${req.originalUrl} does not exist.`
    }
  });
});

// Centralized error middleware
app.use(errorHandler);

export default app;
