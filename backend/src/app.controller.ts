import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health/db')
  async dbCheck() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', db: 'connected' };
  }
}
