import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

console.log('Swagger config loaded with PORT: ', process.env.PORT);
const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'HR Management API',
    version: '1.0.0',
    description: 'RESTful API for HR Management System',
    contact: {
      name: 'API Support',
      email: 'support@hrmanagement.com',
    },
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 5001}/api/${process.env.API_VERSION || 'v1'}`,
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Error message',
          },
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                example: 'ERROR_CODE',
              },
              details: {
                type: 'object',
              },
            },
          },
        },
      },
      HealthCheck: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Server is running',
          },
          data: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                example: 'OK',
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
              },
              uptime: {
                type: 'number',
                example: 123.456,
              },
              environment: {
                type: 'string',
                example: 'development',
              },
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/modules/**/*.route.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
