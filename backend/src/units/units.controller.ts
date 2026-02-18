import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Controller('units')
export class UnitsController {

    constructor(private readonly unitsService: UnitsService) {}

    @Post()
    create(@Body() createUnitDto: CreateUnitDto, @Req() req) {
        return this.unitsService.create(createUnitDto, req.user.id);
    }

    @Get()
    findAll() {
        return this.unitsService.findAll();
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

}
