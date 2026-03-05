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
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionsDto,
  AssignRoleToUserDto,
} from './dto';
import { JwtAuthGuard } from '@/modules/auth';
import { CurrentUser } from '@/common/decorators';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiProtectedErrors,
} from '@/swagger';

interface JwtUser {
  id: string;
  organizationId: string;
}

@ApiTags('RBAC - Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiProtectedErrors()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo rol',
    description:
      'Crea un nuevo rol en la organización del usuario. Roles de sistema no pueden ser editados.',
  })
  @ApiCreatedResponse('Rol creado exitosamente')
  create(@Body() createRoleDto: CreateRoleDto, @CurrentUser() user: JwtUser) {
    return this.rolesService.create(createRoleDto, user.organizationId);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos los roles',
    description:
      'Obtiene todos los roles disponibles (organzación + globales). Incluye contador de usuarios con cada rol.',
  })
  @ApiOkResponse('Roles obtenidos exitosamente')
  findAll(@CurrentUser() user: JwtUser) {
    return this.rolesService.findAll(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalles de un rol',
    description: 'Obtiene información completa de un rol incluidos sus permisos.',
  })
  @ApiParam({ name: 'id', description: 'ID del rol en UUID' })
  @ApiOkResponse('Rol obtenido exitosamente')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.rolesService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un rol',
    description:
      'Actualiza nombre, descripción y permisos de un rol. No se puede editar slug ni scope.',
  })
  @ApiParam({ name: 'id', description: 'ID del rol en UUID' })
  @ApiOkResponse('Rol actualizado exitosamente')
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.rolesService.update(id, updateRoleDto, user.organizationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar un rol',
    description:
      'Elimina un rol solo si no tiene usuarios asignados. Roles de sistema no pueden ser eliminados.',
  })
  @ApiParam({ name: 'id', description: 'ID del rol en UUID' })
  @ApiOkResponse('Rol eliminado exitosamente')
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.rolesService.remove(id, user.organizationId);
  }

  @Post(':id/permissions')
  @ApiOperation({
    summary: 'Asignar permisos a un rol',
    description: 'Reemplaza todos los permisos del rol con los proporcionados.',
  })
  @ApiParam({ name: 'id', description: 'ID del rol en UUID' })
  @ApiBody({
    type: AssignPermissionsDto,
    description: 'Lista de IDs de permisos a asignar',
  })
  @ApiOkResponse('Permisos asignados exitosamente')
  assignPermissions(
    @Param('id') id: string,
    @Body() assignPermissionsDto: AssignPermissionsDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.rolesService.assignPermissions(
      id,
      assignPermissionsDto,
      user.organizationId,
    );
  }

  @Post('assign')
  @ApiOperation({
    summary: 'Asignar rol a un usuario',
    description: 'Asigna un rol a un usuario en su organización actual.',
  })
  @ApiBody({
    type: AssignRoleToUserDto,
    description: 'IDs del usuario y rol a asignar',
  })
  @ApiCreatedResponse('Rol asignado al usuario exitosamente')
  assignRoleToUser(
    @Body() assignRoleToUserDto: AssignRoleToUserDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.rolesService.assignRoleToUser(
      assignRoleToUserDto.userId,
      assignRoleToUserDto.roleId,
      user.organizationId,
    );
  }

  @Delete('assign/:userId/:roleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remover rol de un usuario',
    description: 'Remueve un rol asignado a un usuario en su organización.',
  })
  @ApiParam({ name: 'userId', description: 'ID del usuario en UUID' })
  @ApiParam({ name: 'roleId', description: 'ID del rol en UUID' })
  @ApiOkResponse('Rol removido del usuario exitosamente')
  removeRoleFromUser(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.rolesService.removeRoleFromUser(
      userId,
      roleId,
      user.organizationId,
    );
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Obtener roles de un usuario',
    description: 'Lista todos los roles asignados a un usuario en la organización.',
  })
  @ApiParam({ name: 'userId', description: 'ID del usuario en UUID' })
  @ApiOkResponse('Roles del usuario obtenidos exitosamente')
  getUserRoles(@Param('userId') userId: string, @CurrentUser() user: JwtUser) {
    return this.rolesService.getUserRoles(userId, user.organizationId);
  }
}
