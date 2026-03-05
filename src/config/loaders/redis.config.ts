import { registerAs } from '@nestjs/config';
import { RedisConfig } from '../interfaces';

export default registerAs<RedisConfig>('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
}));
