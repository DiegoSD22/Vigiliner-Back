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
}

@ApiTags('Users')
@ApiProtected()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear usuario en la organización actual',
    description:
      'Crea un usuario dentro de la organización del usuario autenticado y asigna roles por slug (por defecto org-admin).',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse('Usuario creado exitosamente')
  create(@Body() createUserDto: CreateUserDto, @CurrentUser() user: JwtUser) {
    return this.usersService.create(createUserDto, user.organizationId);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar usuarios de la organización actual',
    description: 'Retorna usuarios activos (no eliminados) de la organización actual.',
  })
  @ApiOkResponse('Usuarios obtenidos exitosamente')
  findAll(@CurrentUser() user: JwtUser) {
    return this.usersService.findAll(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener usuario por ID',
    description: 'Retorna un usuario específico de la organización actual.',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario en UUID' })
  @ApiOkResponse('Usuario obtenido exitosamente')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.usersService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar usuario',
    description:
      'Actualiza datos base del usuario y opcionalmente reemplaza sus roles dentro de la organización actual.',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario en UUID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse('Usuario actualizado exitosamente')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.usersService.update(id, updateUserDto, user.organizationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar usuario',
    description:
      'Realiza soft delete del usuario en la organización actual y elimina sus asignaciones de rol en esa organización.',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario en UUID' })
  @ApiOkResponse('Usuario eliminado exitosamente')
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.usersService.remove(id, user.organizationId);
  }
}
