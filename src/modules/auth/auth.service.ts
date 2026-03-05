import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma';
import { RegisterDto, LoginDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, organizationName } = registerDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear organización
    const organization = await this.prismaService.organization.create({
      data: {
        name: organizationName,
        slug: this.generateSlug(organizationName),
        status: 'ACTIVE',
      },
    });

    // Crear usuario
    const user = await this.prismaService.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        organizationId: organization.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        organizationId: true,
        createdAt: true,
      },
    });

    const accessToken = await this.generateAccessToken({
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
    });

    return {
      message: 'Usuario registrado exitosamente',
      data: {
        user,
        accessToken,
        tokenType: 'Bearer',
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Buscar usuario
    const user = await this.prismaService.user.findUnique({
      where: { email },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // TODO: Generar JWT token aquí cuando se implemente estrategia JWT
    // Por ahora, retornar datos del usuario

    const { password: _, ...userWithoutPassword } = user;

    const accessToken = await this.generateAccessToken({
      sub: userWithoutPassword.id,
      email: userWithoutPassword.email,
      organizationId: userWithoutPassword.organizationId,
    });

    return {
      message: 'Login exitoso',
      data: {
        user: userWithoutPassword,
        accessToken,
        tokenType: 'Bearer',
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    const { password: _, ...safeUser } = user;
    return {
      message: 'Perfil obtenido exitosamente',
      data: safeUser,
    };
  }

  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  /**
   * Generar slug de organización a partir del nombre
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  }
}
