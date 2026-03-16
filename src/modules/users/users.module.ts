import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma';
import { UsersController } from './users.controller';
import { OrganizationUsersController } from './organization-users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController, OrganizationUsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
