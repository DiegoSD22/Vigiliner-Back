import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, AuthResponseDto } from './dto';
import { JwtAuthGuard } from './guards';
import { CurrentUser } from './decorators';
import { AuthenticatedUser } from './interfaces/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint de autenticación (login)
   * @param signInDto - Credenciales de inicio de sesión
   * @returns Token JWT y datos del usuario
   */
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() signInDto: SignInDto): Promise<AuthResponseDto> {
    return this.authService.signIn(signInDto);
  }

  /**
   * Endpoint para obtener el perfil del usuario autenticado
   * Requiere autenticación mediante JWT
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
