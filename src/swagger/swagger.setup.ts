import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './swagger.config';

/**
 * Configura Swagger en la aplicación
 * @param app - Instancia de la aplicación NestJS
 * @param path - Ruta donde se expondrá la documentación (default: 'api/docs')
 */
export function setupSwagger(
  app: INestApplication,
  path: string = 'api/docs',
): void {
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(path, app, document, {
    customSiteTitle: 'Vigiliner API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });
}
