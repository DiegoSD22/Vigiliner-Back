import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import { PrismaService } from './prisma';
import { AllConfigType } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          message: Object.values(error.constraints || {}).join(', '),
        }));
        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: formattedErrors,
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
