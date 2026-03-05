import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import { AllConfigType } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Obtener ConfigService
  const configService = app.get(ConfigService<AllConfigType>);
  const port = configService.get('app.port', { infer: true }) || 3000;

  // Configurar Swagger/OpenAPI
  setupSwagger(app, 'api/docs');

  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();
