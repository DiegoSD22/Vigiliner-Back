import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto, UpdatePermissionDto } from './dto';
import { JwtAuthGuard } from '@/modules/auth';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiProtectedErrors,
} from '@/swagger';

@ApiTags('RBAC - Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiProtectedErrors()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo permiso',
    description:
      'Crea un permiso del sistema. El slug se genera automáticamente en formato "resource:action".',
  })
  @ApiCreatedResponse('Permiso creado exitosamente')
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos los permisos',
    description:
      'Obtiene todos los permisos del sistema. Puede filtrar por recurso.',
  })
  @ApiQuery({
    name: 'resource',
    required: false,
    description: 'Filtrar permisos por nombre del recurso (ej: users, roles)',
  })
  @ApiOkResponse('Permisos obtenidos exitosamente')
  findAll(@Query('resource') resource?: string) {
    return this.permissionsService.findAll(resource);
  }

  @Get('resources')
  @ApiOperation({
    summary: 'Obtener lista de recursos únicos',
    description:
      'Obtiene todos los nombres únicos de recursos con permisos definidos.',
  })
  @ApiOkResponse('Recursos obtenidos exitosamente')
  getResources() {
    return this.permissionsService.getResources();
  }

  @Get('grouped')
  @ApiOperation({
    summary: 'Obtener permisos agrupados por recurso',
    description:
      'Retorna un objeto con los permisos agrupados por recurso para UI más eficiente.',
  })
  @ApiOkResponse('Permisos agrupados obtenidos exitosamente')
  findGroupedByResource() {
    return this.permissionsService.findGroupedByResource();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalles de un permiso',
    description: 'Obtiene información completa de un permiso y qué roles lo tienen.',
  })
  @ApiParam({ name: 'id', description: 'ID del permiso en UUID' })
  @ApiOkResponse('Permiso obtenido exitosamente')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un permiso',
    description: 'Actualiza nombre y descripción de un permiso. Resource y action no pueden cambiar.',
  })
  @ApiParam({ name: 'id', description: 'ID del permiso en UUID' })
  @ApiOkResponse('Permiso actualizado exitosamente')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar un permiso',
    description:
      'Elimina un permiso solo si no está asignado a ningún rol. No puede haber roles dependientes.',
  })
  @ApiParam({ name: 'id', description: 'ID del permiso en UUID' })
  @ApiOkResponse('Permiso eliminado exitosamente')
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
}
