import { registerAs } from '@nestjs/config';
import { DatabaseConfig } from '../interfaces';

export default registerAs<DatabaseConfig>('database', () => ({
  url: process.env.DATABASE_URL || 'postgresql://localhost:5432/vigiliner',
}));
