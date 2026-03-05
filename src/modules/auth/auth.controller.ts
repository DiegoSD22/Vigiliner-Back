import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiPublicErrors,
} from '@/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';

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
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'user@example.com',
    name: 'Juan Pérez',
    organizationId: '550e8400-e29b-41d4-a716-446655440001',
    createdAt: '2026-03-05T10:30:00Z',
  })
  @ApiPublicErrors()
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Valida las credenciales del usuario y retorna sus datos de perfil.',
  })
  @ApiOkResponse('Login exitoso', {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'user@example.com',
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
  @ApiPublicErrors()
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
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
