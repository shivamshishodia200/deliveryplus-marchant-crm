export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'DeliveryPlus Enterprise CRM REST API',
    version: '1.0.0',
    description: 'Enterprise API documentation for DeliveryPlus CRM operations, customer lifecycle, and pipeline management.'
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Primary REST API v1 Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'access_token'
      }
    }
  },
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  paths: {
    '/auth/login': {
      post: {
        summary: 'Authenticate user & issue session',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'admin@deliveryplus.com' },
                  password: { type: 'string', example: 'DeliveryPlus2026!' }
                },
                required: ['email', 'password']
              }
            }
          }
        },
        responses: {
          200: { description: 'Authentication successful' },
          401: { description: 'Invalid credentials' }
        }
      }
    },
    '/reports/dashboard': {
      get: {
        summary: 'Fetch calculated real-time KPI metrics',
        responses: {
          200: { description: 'Dashboard metrics returned' }
        }
      }
    },
    '/leads': {
      get: {
        summary: 'Query leads with filters and search',
        responses: { 200: { description: 'List of leads' } }
      },
      post: {
        summary: 'Create a new lead',
        responses: { 201: { description: 'Lead created' } }
      }
    },
    '/opportunities': {
      get: {
        summary: 'Query opportunities or get Kanban pipeline matrix',
        responses: { 200: { description: 'Opportunities list or Kanban view' } }
      }
    }
  }
};
