import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { DevicesModule } from './modules/devices/devices.module';
import { UnitsModule } from './modules/units/units.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que ConfigModule esté disponible en toda la aplicación
      envFilePath: '.env',
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    DevicesModule,
    UnitsModule,
  ],
})
export class AppModule {}
