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
    const { email, password, name, organizationName, username } = registerDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('El email ya está registrado');
    }

    const resolvedUsername = await this.resolveUniqueUsername(
      username || email.split('@')[0],
    );

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
        username: resolvedUsername,
        password: hashedPassword,
        name,
        organizationId: organization.id,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        organizationId: true,
        createdAt: true,
      },
    });

    const accessToken = await this.generateAccessToken(
      user.id,
      user.email,
      user.organizationId,
    );

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
    const { identifier, password } = loginDto;

    // Buscar usuario
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
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
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password: _, ...userWithoutPassword } = user;

    const accessToken = await this.generateAccessToken(
      userWithoutPassword.id,
      userWithoutPassword.email,
      userWithoutPassword.organizationId,
    );

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

  /**
   * Generar token de acceso JWT con roles y permisos del usuario
   */
  private async generateAccessToken(
    userId: string,
    email: string,
    organizationId: string,
  ): Promise<string> {
    // Cargar roles y permisos del usuario
    const userRoles = await this.prismaService.userRole.findMany({
      where: {
        userId,
        organizationId,
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    // Extraer slugs de roles
    const roles = userRoles.map((ur) => ur.role.slug);

    // Extraer permisos únicos de todos los roles
    const permissionsSet = new Set<string>();
    for (const userRole of userRoles) {
      for (const rolePermission of userRole.role.permissions) {
        permissionsSet.add(rolePermission.permission.slug);
      }
    }
    const permissions = Array.from(permissionsSet);

    const payload: JwtPayload = {
      sub: userId,
      email,
      organizationId,
      roles,
      permissions,
    };

    return this.jwtService.signAsync(payload);
  }

  private normalizeUsername(input: string): string {
    const normalized = input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9._-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    return normalized.slice(0, 50) || `user-${Date.now()}`;
  }

  private async resolveUniqueUsername(base: string): Promise<string> {
    const normalizedBase = this.normalizeUsername(base);
    let candidate = normalizedBase;
    let suffix = 1;

    while (true) {
      const exists = await this.prismaService.user.findUnique({
        where: { username: candidate },
        select: { id: true },
      });

      if (!exists) {
        return candidate;
      }

      candidate = `${normalizedBase}-${suffix}`.slice(0, 50);
      suffix += 1;
    }
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
