import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '@/common/decorators/require-permissions.decorator';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * Guard para verificar permisos del usuario
 * 
 * Este guard verifica que el usuario autenticado tenga los permisos especificados
 * mediante el decorador @RequirePermissions()
 * 
 * @example
 * ```typescript
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @RequirePermissions('users:write')
 * @Post('users')
 * async createUser() { ... }
 * ```
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no hay permisos requeridos, permitir acceso
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        'Usuario no autenticado',
      );
    }

    // Obtener todos los permisos del usuario a través de sus roles
    const userRoles = await this.prisma.userRole.findMany({
      where: {
        userId: user.id,
        organizationId: user.organizationId,
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

    // Extraer todos los permisos únicos del usuario
    const userPermissions = new Set<string>();
    for (const userRole of userRoles) {
      for (const rolePermission of userRole.role.permissions) {
        userPermissions.add(rolePermission.permission.slug);
      }
    }

    // Verificar si el usuario tiene todos los permisos requeridos
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.has(permission),
    );

    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter(
        (permission) => !userPermissions.has(permission),
      );

      throw new ForbiddenException(
        `Permisos insuficientes. Se requieren: ${missingPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
