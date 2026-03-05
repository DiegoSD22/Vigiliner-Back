import { ConfigModuleOptions } from '@nestjs/config';
import {
  appConfig,
  databaseConfig,
  jwtConfig,
  redisConfig,
  corsConfig,
} from './loaders';
import { validationSchema } from './schemas';

/**
 * Opciones centralizadas para ConfigModule
 * Todas las configuraciones del módulo de configuración están aquí
 */
export const configModuleOptions: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: '.env',
  load: [appConfig, databaseConfig, jwtConfig, redisConfig, corsConfig],
  validationSchema,
  validationOptions: {
    allowUnknown: true,
    abortEarly: false,
  },
};
