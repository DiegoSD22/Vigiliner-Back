import { DocumentBuilder } from '@nestjs/swagger';

/**
 * Configuración de Swagger/OpenAPI
 */
export const swaggerConfig = new DocumentBuilder()
  .setTitle('Vigiliner API')
  .setDescription('API de gestión para sistema Vigiliner')
  .setVersion('1.0')
  .addTag('auth', 'Autenticación y autorización')
  .addTag('users', 'Gestión de usuarios')
  .addTag('devices', 'Gestión de dispositivos GPS')
  .addTag('units', 'Gestión de unidades/vehículos')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Ingresa tu token JWT',
      in: 'header',
    },
    'JWT-auth', // Este nombre se usará en los decoradores @ApiBearerAuth()
  )
  .build();
