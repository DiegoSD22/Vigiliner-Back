import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configModuleOptions } from './config';
import { PrismaModule } from './prisma';
import { AuthModule } from './modules/auth';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    PrismaModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
