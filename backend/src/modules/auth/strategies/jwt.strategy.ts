import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../prisma/prisma.service';
import { JwtPayload, AuthenticatedUser } from '../interfaces/auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'vigiliner_secret_key_change_in_production',
    });
  }

  /**
   * Valida el payload del JWT y retorna el usuario
   * Este método es llamado automáticamente por Passport cuando el token es válido
   * @param payload - Datos del JWT decodificado
   * @returns Usuario autenticado
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const { sub: userId, email, role } = payload;

    // Validar que el usuario aún existe y no ha sido eliminado
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Usuario no autorizado');
    }

    // El objeto retornado se adjunta a request.user
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
