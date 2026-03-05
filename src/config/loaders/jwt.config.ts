import { registerAs } from '@nestjs/config';
import { JwtConfig } from '../interfaces';

export default registerAs<JwtConfig>('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default-secret-change-me',
  expiresIn: process.env.JWT_EXPIRATION || '24h',
}));
