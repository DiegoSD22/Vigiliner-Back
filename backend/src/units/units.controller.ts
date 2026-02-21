import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { PrismaService } from 'prisma/prisma.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('units')
export class UnitsController {

    constructor(private readonly unitsService: UnitsService, private readonly prisma: PrismaService) {}

    @Post()
    create(@Body() createUnitDto: CreateUnitDto, @Req() req) {
        return this.unitsService.create(createUnitDto, req.user.id);
    }


    @Get('my-units')
    async getMyUnits(@Req() req) {
        const userId = req.user.id;
        return this.prisma.unit.findMany({
            where: {
                userId: userId,
            },
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.unitsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
        return this.unitsService.update(id, updateUnitDto);
    }

    @Patch(':id/remove')
    remove(@Param('id') id: string) {
        return this.unitsService.remove(id);
    }

    @Patch(':id/restore')
    restore(@Param('id') id: string) {
        return this.unitsService.restore(id);
    }

    @Get()
    async getUnits(){

        const units = await this.prisma.unit.findMany({
            include: {
                device: true,
            },
        });

        const now = new Date();

        return units.map(unit => {
            let computedStatus = unit.status;

            if (unit.lastSeen) {
                const diffMinutes = (now.getTime() - unit.lastSeen.getTime()) / 60000;
                if (diffMinutes > 3) {
                    computedStatus = 'OFFLINE';
                }
            } else {
                computedStatus = 'OFFLINE';
            }

            return {
                ...unit,
                status: computedStatus,
            };
        });
    }

    

}