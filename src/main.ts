import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import { PrismaService } from './prisma';
import { AllConfigType } from './config';
import { AllExceptionsFilter } from './common/filters';
import { ResponseInterceptor } from './common/interceptors';

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

  // Configurar Swagger/OpenAPI
  setupSwagger(app, 'api/docs');

  // Activar shutdown hooks para Prisma
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();
