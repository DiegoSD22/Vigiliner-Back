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
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators';
import { JwtAuthGuard } from '@/modules/auth';
import { ApiCreatedResponse, ApiOkResponse, ApiProtected } from '@/swagger';
import { CreateUserDto, UpdateUserDto } from './dto';
import { UsersService } from './users.service';

interface JwtUser {
  id: string;
  organizationId: string;
  roles?: string[];
}

@ApiTags('Users')
@ApiProtected()
@UseGuards(JwtAuthGuard)
@Controller('organizations/:organizationId/users')
export class OrganizationUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear usuario en una organización específica',
    description:
      'Permite gestionar usuarios por contexto explícito de organización. Super-admin puede operar sobre cualquier organización.',
  })
  @ApiParam({ name: 'organizationId', description: 'ID de la organización en UUID' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse('Usuario creado exitosamente')
  create(
    @Param('organizationId') organizationId: string,
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.usersService.createInOrganization(
      createUserDto,
      organizationId,
      user,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Listar usuarios de una organización específica',
    description:
      'Retorna usuarios activos de la organización indicada en la ruta. Super-admin puede consultar cualquier organización.',
  })
  @ApiParam({ name: 'organizationId', description: 'ID de la organización en UUID' })
  @ApiOkResponse('Usuarios obtenidos exitosamente')
  findAll(
    @Param('organizationId') organizationId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.usersService.findAllByOrganization(organizationId, user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener usuario por ID en una organización específica',
    description:
      'Busca un usuario dentro de la organización indicada. Super-admin puede consultar cualquier organización.',
  })
  @ApiParam({ name: 'organizationId', description: 'ID de la organización en UUID' })
  @ApiParam({ name: 'id', description: 'ID del usuario en UUID' })
  @ApiOkResponse('Usuario obtenido exitosamente')
  findOne(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.usersService.findOneByOrganization(id, organizationId, user);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar usuario en una organización específica',
    description:
      'Actualiza datos y roles del usuario dentro de la organización indicada. Super-admin puede operar sobre cualquier organización.',
  })
  @ApiParam({ name: 'organizationId', description: 'ID de la organización en UUID' })
  @ApiParam({ name: 'id', description: 'ID del usuario en UUID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse('Usuario actualizado exitosamente')
  update(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.usersService.updateInOrganization(
      id,
      updateUserDto,
      organizationId,
      user,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar usuario en una organización específica',
    description:
      'Realiza soft delete del usuario dentro de la organización indicada. Super-admin puede operar sobre cualquier organización.',
  })
  @ApiParam({ name: 'organizationId', description: 'ID de la organización en UUID' })
  @ApiParam({ name: 'id', description: 'ID del usuario en UUID' })
  @ApiOkResponse('Usuario eliminado exitosamente')
  remove(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.usersService.removeInOrganization(id, organizationId, user);
  }
}
