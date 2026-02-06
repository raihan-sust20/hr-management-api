import knex, { Knex } from 'knex';
import { singleton } from 'tsyringe';
import knexConfig from '../knexfile';
import logger from './logger.config';

@singleton()
export class DatabaseConfig {
  private static instance: Knex | null = null;

  public getConnection(): Knex {
    if (!DatabaseConfig.instance) {
      const environment = process.env.NODE_ENV || 'development';
      const config = knexConfig[environment];

      if (!config) {
        throw new Error(`No database configuration found for environment: ${environment}`);
      }

      DatabaseConfig.instance = knex(config);
      logger.info('Database connection pool initialized', {
        environment,
        pool: config.pool,
      });

      // Test connection
      void this.testConnection();
    }

    return DatabaseConfig.instance;
  }

  private async testConnection(): Promise<void> {
    try {
      await DatabaseConfig.instance?.raw('SELECT 1');
      logger.info('Database connection test successful');
    } catch (error) {
      logger.error('Database connection test failed', { error });
      throw error;
    }
  }

  public async closeConnection(): Promise<void> {
    if (DatabaseConfig.instance) {
      await DatabaseConfig.instance.destroy();
      DatabaseConfig.instance = null;
      logger.info('Database connection pool closed');
    }
  }
}

export default DatabaseConfig;
