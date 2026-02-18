import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { DevicesGateway } from './devices.gateway';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, JwtModule, AuthModule],
  providers: [DevicesService, DevicesGateway],
  controllers: [DevicesController]
})
export class DevicesModule {}
