import { registerAs } from '@nestjs/config';
import { CorsConfig } from '../interfaces';

export default registerAs<CorsConfig>('cors', () => {
  const origin = process.env.CORS_ORIGIN || '*';
  return {
    origin: origin.includes(',') ? origin.split(',') : origin,
  };
});
