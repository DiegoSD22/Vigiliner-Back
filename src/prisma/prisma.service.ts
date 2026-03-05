import { INestApplication, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

/**
 * PrismaService - Gestiona la conexión singleton a PostgreSQL
 *
 * - Extends PrismaClient
 * - Adapter PostgreSQL directo
 * - Conexión automática en onModuleInit()
 * - Graceful shutdown en SIGTERM/SIGINT
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private pool: Pool;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const adapter = new PrismaPg(pool);

    super({ adapter });

    this.pool = pool;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('📊 Conexión a BD establecida');
    } catch (error) {
      this.logger.error('Error conectando a Prisma:', error);
      throw error;
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('SIGTERM', async () => {
      this.logger.log('SIGTERM recibido, cerrando conexión...');
      await this.$disconnect();
      await this.pool.end();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      this.logger.log('SIGINT recibido, cerrando conexión...');
      await this.$disconnect();
      await this.pool.end();
      process.exit(0);
    });
  }
}
