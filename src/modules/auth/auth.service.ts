import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@/prisma';
import { RegisterDto, LoginDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

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

    return {
      message: 'Usuario registrado exitosamente',
      data: user,
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

    return {
      message: 'Login exitoso',
      data: userWithoutPassword,
      // token: generarJWT(user) será implementado después
    };
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
