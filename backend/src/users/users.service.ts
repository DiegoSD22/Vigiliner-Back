import { UpdateUserDto } from './dto/update-user.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const userCreated = await this.prisma.user.create({ data: { ...data, password: hashedPassword } });
    const { password, ...userWithoutPassword } = userCreated;
    return userWithoutPassword;
  }

  async findAll(paginationDto: PaginationDto) {
    const { from = 0, limit = 10 } = paginationDto;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: from,
        take: limit,
      }),
      this.prisma.user.count(),
    ]);
    return { users, total };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: string, data: UpdateUserDto) {
    // Si se provee password, hashearla
    let updateData = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    const userUpdated = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });
    const { password, ...userWithoutPassword } = userUpdated;
    return userWithoutPassword;
  }

  async remove(id: string) {
    // Soft delete: actualiza deletedAt
    const user = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

}
