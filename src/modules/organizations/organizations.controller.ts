import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiProtected,
} from '@/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';

@ApiTags('Organizations')
@ApiProtected()
@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear organización cliente',
    description:
      'Crea una nueva organización (cliente) en el sistema con slug único y estado inicial.',
  })
  @ApiBody({ type: CreateOrganizationDto })
  @ApiCreatedResponse('Organización creada exitosamente')
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar organizaciones',
    description: 'Retorna todas las organizaciones activas/no eliminadas del sistema.',
  })
  @ApiOkResponse('Organizaciones obtenidas exitosamente')
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener organización por ID',
    description: 'Retorna una organización específica por su identificador UUID.',
  })
  @ApiParam({ name: 'id', description: 'ID de la organización en UUID' })
  @ApiOkResponse('Organización obtenida exitosamente')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar organización',
    description: 'Actualiza nombre, slug o estado de una organización existente.',
  })
  @ApiParam({ name: 'id', description: 'ID de la organización en UUID' })
  @ApiBody({ type: UpdateOrganizationDto })
  @ApiOkResponse('Organización actualizada exitosamente')
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Archivar organización',
    description:
      'Realiza un borrado lógico (soft delete) marcando la organización como ARCHIVED.',
  })
  @ApiParam({ name: 'id', description: 'ID de la organización en UUID' })
  @ApiOkResponse('Organización archivada exitosamente')
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }
}
