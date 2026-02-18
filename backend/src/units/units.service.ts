import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {

    constructor(private prisma: PrismaService) {}

    create(data: CreateUnitDto, userId: string) {
        return this.prisma.unit.create({
            data: {
                ...data,
                createdBy: {
                    connect: { id: userId },
                },
            }
        });
    }

    findAll() {
        return this.prisma.unit.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const unit = this.prisma.unit.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });

        if (!unit) {
            throw new NotFoundException('Unit not found');
        }
        return unit;
    }

    async update(id: string, data: UpdateUnitDto) {
        const unit = this.prisma.unit.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });

        if (!unit) {
            throw new NotFoundException('Unit not found');
        }
        
        return this.prisma.unit.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
    }

    async remove(id: string) {
        const unit = this.prisma.unit.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });
        
        if (!unit) {
            throw new NotFoundException('Unit not found');
        }

        return this.prisma.unit.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    async restore(id: string) {
        const unit = this.prisma.unit.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });

        if (!unit) {
            throw new NotFoundException('Unit not found');
        }

        return this.prisma.unit.update({
            where: { id },
            data: {
                deletedAt: null,
            },
        });
    }

}