import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/common/decorators/require-roles.decorator';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * Guard para verificar roles del usuario
 * 
 * Este guard verifica que el usuario autenticado tenga al menos uno de los roles
 * especificados mediante el decorador @RequireRoles()
 * 
 * @example
 * ```typescript
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @RequireRoles('admin', 'super-admin')
 * @Delete('organizations/:id')
 * async deleteOrganization() { ... }
 * ```
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Obtener todos los roles del usuario
    const userRoles = await this.prisma.userRole.findMany({
      where: {
        userId: user.id,
        organizationId: user.organizationId,
      },
      include: {
        role: true,
      },
    });

    // Extraer los slugs de roles del usuario
    const userRoleSlugs = userRoles.map((ur) => ur.role.slug);

    // Verificar si el usuario tiene al menos uno de los roles requeridos
    const hasRequiredRole = requiredRoles.some((role) =>
      userRoleSlugs.includes(role),
    );

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Acceso denegado. Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
