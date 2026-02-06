import 'reflect-metadata';
import dotenv from 'dotenv';
import { container } from 'tsyringe';

// Load environment variables
dotenv.config();

import app from './app';
import logger from './config/logger.config';
import DatabaseConfig from './config/database.config';

const PORT = parseInt(process.env.PORT || '5001', 10);
const HOST = process.env.HOST || '0.0.0.0';

class Server {
  private server: any;

  public async start(): Promise<void> {
    try {
      // Test database connection
      const dbConfig = container.resolve(DatabaseConfig);
      await this.testDatabaseConnection(dbConfig);

      // Start HTTP server
      this.server = app.listen(PORT, HOST, () => {
        logger.info(`Server started successfully`, {
          port: PORT,
          host: HOST,
          environment: process.env.NODE_ENV || 'development',
          nodeVersion: process.version,
        });
        logger.info(`API Documentation: http://${HOST}:${PORT}/api-docs`);
        logger.info(`Health Check: http://${HOST}:${PORT}/api/v1/health`);
      });

      // Handle server errors
      this.server.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
          logger.error(`Port ${PORT} is already in use`);
        } else {
          logger.error('Server error', { error: error.message });
        }
        process.exit(1);
      });

      // Graceful shutdown
      this.setupGracefulShutdown(dbConfig);
    } catch (error) {
      logger.error('Failed to start server', { error });
      process.exit(1);
    }
  }

  private async testDatabaseConnection(dbConfig: DatabaseConfig): Promise<void> {
    try {
      const db = dbConfig.getConnection();
      await db.raw('SELECT 1');
      logger.info('Database connection established');
    } catch (error) {
      logger.error('Database connection failed', { error });
      throw error;
    }
  }

  private setupGracefulShutdown(dbConfig: DatabaseConfig): void {
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received, starting graceful shutdown`);

      // Close HTTP server
      if (this.server) {
        this.server.close(() => {
          logger.info('HTTP server closed');
        });
      }

      // Close database connections
      try {
        await dbConfig.closeConnection();
        logger.info('Database connections closed');
      } catch (error) {
        logger.error('Error closing database connections', { error });
      }

      process.exit(0);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack,
      });
      void shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled Rejection', {
        reason: reason?.message || reason,
      });
      void shutdown('unhandledRejection');
    });
  }
}

// Start server
const server = new Server();
void server.start();
