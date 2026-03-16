import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configModuleOptions } from './config';
import { PrismaModule } from './prisma';
import { AuthModule } from './modules/auth';
import { RbacModule } from './modules/rbac';
import { OrganizationsModule } from './modules/organizations';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    PrismaModule,
    AuthModule,
    RbacModule,
    OrganizationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
