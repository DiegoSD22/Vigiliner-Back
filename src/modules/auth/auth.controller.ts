import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiProtected,
  ApiPublicErrors,
} from '@/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, LoginResponseDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar nuevo usuario y organización',
    description:
      'Crea un nuevo usuario con su organización asociada. El email debe ser único.',
  })
  @ApiCreatedResponse('Usuario registrado exitosamente', {
    user: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'user@example.com',
      username: 'juan.perez',
      name: 'Juan Pérez',
      organizationId: '550e8400-e29b-41d4-a716-446655440001',
      createdAt: '2026-03-05T10:30:00Z',
    },
    accessToken: 'jwt-token',
    tokenType: 'Bearer',
  })
  @ApiPublicErrors()
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Valida las credenciales del usuario (email o username) y retorna sus datos de perfil, roles y permisos. El frontend es responsable de decidir a qué dashboard redirigir basado en los roles.',
  })
  @ApiOkResponse('Login exitoso', {
    user: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'super-admin@seed.vigiliner.local',
      username: 'super-admin',
      name: 'Super Admin',
      organizationId: '550e8400-e29b-41d4-a716-446655440001',
      createdAt: '2026-03-05T10:30:00Z',
      organization: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Vigiliner Org',
        slug: 'vigiliner-org',
        status: 'ACTIVE',
      },
    },
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InN1cGVyLWFkbWluQHNlZWQudmlnaWxpbmVyLmxvY2FsIiwib3JnYW5pemF0aW9uSWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDEiLCJyb2xlcyI6WyJzdXBlci1hZG1pbiJdLCJwZXJtaXNzaW9ucyI6WyJvcmdhbml6YXRpb25zOnJlYWQiLCJ1c2Vyczpyd2QiLCJyb2xlczphZG1pbiJdLCJpYXQiOjE3NDExNzY0MDAsImV4cCI6MTc0MTI2MjgwMH0.abcd1234',
    tokenType: 'Bearer',
    roles: ['super-admin'],
    permissions: [
      'organizations:read',
      'organizations:write',
      'organizations:delete',
      'organizations:admin',
      'users:read',
      'users:write',
      'users:delete',
      'users:admin',
      'roles:read',
      'roles:write',
      'roles:delete',
      'roles:assign',
      'permissions:read',
      'permissions:write',
    ],
    primaryRole: 'super-admin',
  })
  @ApiPublicErrors()
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener perfil del usuario autenticado',
    description: 'Retorna la información del usuario actual basada en el JWT.',
  })
  @ApiOkResponse('Perfil obtenido exitosamente', {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'user@example.com',
    username: 'super-admin',
    name: 'Juan Pérez',
    organizationId: '550e8400-e29b-41d4-a716-446655440001',
    createdAt: '2026-03-05T10:30:00Z',
    organization: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Mi Empresa',
      slug: 'mi-empresa',
      status: 'ACTIVE',
    },
  })
  @ApiProtected()
  async me(@CurrentUser() user: { id: string }) {
    return this.authService.getProfile(user.id);
  }

  // TODO: Implementar estos endpoints después
  // @Post('refresh-token')
  // @ApiProtected()
  // async refreshToken() { }
  //
  // @Post('logout')
  // @ApiProtected()
  // async logout() { }
  //
  // @Post('forgot-password')
  // async forgotPassword() { }
  //
  // @Post('reset-password')
  // async resetPassword() { }
}
