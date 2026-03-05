import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import { SignInDto, AuthResponseDto } from './dto';
import { JwtPayload } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Autentica un usuario y genera un token JWT
   * @param signInDto - Credenciales de inicio de sesión
   * @returns Token de acceso y datos del usuario
   * @throws UnauthorizedException si las credenciales son inválidas
   */
  async signIn(signInDto: SignInDto): Promise<AuthResponseDto> {
    const { email, password } = signInDto;

    // Buscar usuario por email
    const user = await this.findUserByEmail(email);
    if (!user) {
      this.logger.warn(`Intento de login fallido para email: ${email}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar que el usuario no esté eliminado (soft delete)
    if (user.deletedAt) {
      this.logger.warn(`Intento de login con usuario eliminado: ${email}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await this.validatePassword(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Contraseña incorrecta para usuario: ${email}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token JWT
    const accessToken = await this.generateAccessToken(user);

    this.logger.log(`Usuario autenticado exitosamente: ${email}`);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Busca un usuario por email
   */
  private async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        deletedAt: true,
      },
    });
  }

  /**
   * Valida una contraseña contra su hash
   */
  private async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      this.logger.error('Error al validar contraseña', error);
      return false;
    }
  }

  /**
   * Genera un token JWT para el usuario
   */
  private async generateAccessToken(user: {
    id: string;
    email: string;
    role: Role;
  }): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload);
  }
}
