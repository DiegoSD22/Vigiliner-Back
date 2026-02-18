import { Controller, Param, Patch, Query, Req } from '@nestjs/common';
import { Body, Post, Get, UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  create(@Body() dto: CreateDeviceDto, @Req() req) {
    return this.devicesService.create(dto, req.user.id);
  }

  @Get()
  findMy(@Req() req) {
    return this.devicesService.findAllByUser(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.devicesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDeviceDto,
    @Req() req,
  ) {
    return this.devicesService.update(id, dto);
  }

  @Patch(':id/remove')
  remove(@Param('id') id: string, @Req() req) {
    return this.devicesService.remove(id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string, @Req() req) {
    return this.devicesService.restore(id);
  }

  @Get(':id/locations')
  getLocations(
    @Param('id') id: string,
    @Query('start') start: string,
    @Query('end') end: string,
    @Req() req,
  ) {
    return this.devicesService.getLocations(id, start, end);
  }

}
