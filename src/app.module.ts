import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configModuleOptions } from './config';
import { PrismaModule } from './prisma';

@Module({
  imports: [ConfigModule.forRoot(configModuleOptions), PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
