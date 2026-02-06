import 'reflect-metadata';
import express, { Application, Request, Response } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { container } from 'tsyringe';
import { swaggerSpec } from './config/swagger.config';
import DatabaseConfig from './config/database.config';
import logger from './config/logger.config';
import { errorHandler, notFoundHandler } from './common/middlewares/error.middleware';
import { ResponseUtil } from './common/utils/response.util';

import authRoutes from './modules/auth/auth.route';
import { env } from 'process';

// Register dependencies
container.register(DatabaseConfig, { useClass: DatabaseConfig });

class App {
  public app: Application;
  private apiVersion: string;

  constructor() {
    this.app = express();
    this.apiVersion = process.env.API_VERSION || 'v1';
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Body parsers
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // HTTP request logger
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(
        morgan('combined', {
          stream: {
            write: (message: string) => logger.info(message.trim()),
          },
        })
      );
    }

    // Security middleware
    this.app.use(
      cors({
        origin: env.CORS_ORIGIN.trim().split(','),
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
        // allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );

    this.app.options('/', cors()); // handle preflight requests
    this.app.use(helmet());

    // If behind a proxy (e.g., Heroku, Nginx), trust the proxy
    this.app.set('trust proxy', 1);
  }

  private initializeRoutes(): void {
    const apiPrefix = `/api/${this.apiVersion}`;

    /**
     * @swagger
     * /health:
     *   get:
     *     summary: Health check endpoint
     *     tags: [Health]
     *     responses:
     *       200:
     *         description: Server is running
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HealthCheck'
     */
    this.app.get(`${apiPrefix}/health`, (_req: Request, res: Response) => {
      ResponseUtil.success(res, 'Server is running', {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
      });
    });

    // Swagger documentation
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Module routes will be added here
    // Example: this.app.use(`${apiPrefix}/auth`, authRoutes);
    this.app.use(`${apiPrefix}/auth`, authRoutes);
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public getApp(): Application {
    return this.app;
  }
}

export default new App().getApp();
