import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from '../prisma/prisma.service';
import { DevicesGateway } from './devices/devices.gateway';
import { startTcpServer } from './tcp/tcp.server';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  
  const prisma = app.get(PrismaService);
  const gateway = app.get(DevicesGateway);
  startTcpServer(prisma, gateway);
}
bootstrap();
