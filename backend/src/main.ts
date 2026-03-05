import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaService } from '../prisma/prisma.service';
import { DevicesGateway } from './modules/devices/devices.gateway';
import { startTcpServer } from './tcp/tcp.server';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remueve propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no definidas
      transform: true, // Transforma los tipos automáticamente
    }),
  );
  
  app.enableCors({
    origin: '*',
    credentials: true,
  });
  
  await app.listen(3000);
  
  const prisma = app.get(PrismaService);
  const gateway = app.get(DevicesGateway);
  startTcpServer(prisma, gateway);
}
bootstrap();
