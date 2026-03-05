// src/users/users.controller.ts
import { Controller, Get, Post, Body, Param, Query, Patch, Delete, UseInterceptors } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from './dto/pagination.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return plainToInstance(UserEntity, user);
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('ADMIN', 'USER')
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    const result = await this.usersService.findAll(paginationDto);
    return {
      ...result,
      users: result.users.map(user => plainToInstance(UserEntity, user)),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return plainToInstance(UserEntity, user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    return plainToInstance(UserEntity, user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const user = await this.usersService.remove(id);
    return plainToInstance(UserEntity, user);
  }

}
