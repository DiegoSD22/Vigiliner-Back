import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar nuevo usuario y organización',
    description: 'Crea un nuevo usuario y su organización asociada',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    schema: {
      example: {
        message: 'Usuario registrado exitosamente',
        user: {
          id: 'uuid-here',
          email: 'user@example.com',
          name: 'Juan Pérez',
          organizationId: 'org-uuid',
          createdAt: '2024-01-15T10:30:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'El email ya está registrado o datos inválidos',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Valida credenciales y retorna datos del usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      example: {
        message: 'Login exitoso',
        user: {
          id: 'uuid-here',
          email: 'user@example.com',
          name: 'Juan Pérez',
          organizationId: 'org-uuid',
          createdAt: '2024-01-15T10:30:00Z',
          organization: {
            id: 'org-uuid',
            name: 'Mi Empresa',
            slug: 'mi-empresa',
            status: 'ACTIVE',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // TODO: Implementar estos endpoints después
  // @Post('refresh-token')
  // @Post('logout')
  // @Post('forgot-password')
  // @Post('reset-password')
}
