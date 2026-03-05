import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './swagger.config';

/**
 * Configura Swagger/OpenAPI en la aplicación
 *
 * @param app - Instancia de la aplicación NestJS
 * @param path - Ruta donde se expondrá la documentación (default: 'api/docs')
 *
 * @example
 * // En main.ts
 * setupSwagger(app, 'api/docs');
 */
export function setupSwagger(
  app: INestApplication,
  path: string = 'api/docs',
): void {
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(path, app, document, {
    customSiteTitle: 'Vigiliner API - Documentation',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .scheme-container { background: #fafafa; }
      body { background: #f5f5f5; }
      .swagger-ui .btn { font-weight: 600; }
      .swagger-ui .modal-sting { position: fixed; z-index: 9999; }
    `,
    swaggerOptions: {
      // Mantener tokens en LocalStorage al recargar
      persistAuthorization: true,
      // No expandir todos los endpoints por defecto
      docExpansion: 'list',
      // Mostrar buscador de tags
      filter: true,
      // Mostrar duración de requests
      showRequestDuration: true,
      // Mostrar headers de request/response
      showOperationFilterTag: true,
      layout: 'BaseLayout',
      // Configuración de red
      requestInterceptor: (request: any) => {
        // Aquí puedes interceptar requests si es necesario
        return request;
      },
      responseInterceptor: (response: any) => {
        // Aquí puedes interceptar responses
        return response;
      },
    },
  });

  console.log(`📚 Swagger documentation available at: http://localhost:${process.env.APP_PORT || 3000}/${path}`);
}

