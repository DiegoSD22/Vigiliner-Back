import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import { PrismaService } from './prisma';
import { AllConfigType } from './config';
import { AllExceptionsFilter } from './common/filters';
import { ResponseInterceptor } from './common/interceptors';

function normalizePathPrefix(prefix: string): string {
  return prefix.replace(/^\/+|\/+$/g, '');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Filtro global de excepciones - DEBE estar primero
  app.useGlobalFilters(new AllExceptionsFilter());

  // Interceptor global de respuestas
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global Validation Pipe - Validar todos los DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remover propiedades no validadas
      forbidNonWhitelisted: true, // Error si hay props extras
      transform: true, // Transformar tipos automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        return new BadRequestException({
          message: 'Validación fallida',
          errors: Object.fromEntries(
            errors.map((e) => [e.property, Object.values(e.constraints || {})])
          ),
        });
      },
    })
  );

  // Obtener ConfigService
  const configService = app.get(ConfigService<AllConfigType>);
  const port = configService.get('app.port', { infer: true }) || 3000;
  const configuredPrefix =
    configService.get('app.apiPrefix', { infer: true }) || 'api/v1';
  const apiPrefix = normalizePathPrefix(configuredPrefix);

  // Prefijo global para estandarizar rutas de la API
  app.setGlobalPrefix(apiPrefix);

  // Configurar Swagger/OpenAPI
  const docsPath = `${apiPrefix}/docs`;
  setupSwagger(app, docsPath);

  // Activar shutdown hooks para Prisma
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`🔗 API Prefix: /${apiPrefix}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/${docsPath}`);
}
bootstrap();
