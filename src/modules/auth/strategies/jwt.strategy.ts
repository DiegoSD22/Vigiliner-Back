import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '@/prisma';
import { AllConfigType } from '@/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService<AllConfigType>,
    private readonly prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret', { infer: true }) as string,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: payload.sub,
        deletedAt: null,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!user || !user.organization || user.organization.deletedAt !== null) {
      throw new UnauthorizedException('Token inválido o usuario inactivo');
    }

    if (user.organization.status !== 'ACTIVE') {
      throw new UnauthorizedException('La organización no está activa');
    }

    const { password: _password, organization, ...safeUser } = user;
    const { deletedAt: _orgDeletedAt, ...safeOrganization } = organization;

    return {
      ...safeUser,
      organization: safeOrganization,
      roles: payload.roles,
      permissions: payload.permissions,
    };
  }
}
