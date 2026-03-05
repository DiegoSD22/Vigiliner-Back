import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from './dto';
import { RoleScope } from '@/prisma';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear un nuevo rol
   */
  async create(createRoleDto: CreateRoleDto, organizationId: string) {
    const { permissionIds, ...roleData } = createRoleDto;

    const targetOrgId =
      roleData.scope === RoleScope.GLOBAL ? null : organizationId;

    // Verificar si el slug ya existe en la organización
    const existingRole = await this.prisma.role.findFirst({
      where: {
        slug: roleData.slug,
        organizationId: targetOrgId,
      },
    });

    if (existingRole) {
      throw new ConflictException(
        `Ya existe un rol con el slug "${roleData.slug}" en esta organización`,
      );
    }

    // Crear el rol
    const role = await this.prisma.role.create({
      data: {
        ...roleData,
        organizationId: targetOrgId,
        permissions: permissionIds
          ? {
              create: permissionIds.map((permissionId) => ({
                permissionId,
              })),
            }
          : undefined,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        organization: true,
      },
    });

    return role;
  }

  /**
   * Listar todos los roles de una organización (incluye roles globales)
   */
  async findAll(organizationId: string) {
    return this.prisma.role.findMany({
      where: {
        OR: [
          { organizationId }, // Roles de la organización
          { scope: RoleScope.GLOBAL }, // Roles globales
        ],
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        organization: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: [{ scope: 'asc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Obtener un rol por ID
   */
  async findOne(id: string, organizationId: string) {
    const role = await this.prisma.role.findFirst({
      where: {
        id,
        OR: [
          { organizationId }, // Roles de la organización
          { scope: RoleScope.GLOBAL }, // Roles globales
        ],
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        organization: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return role;
  }

  /**
   * Actualizar un rol
   */
  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
    organizationId: string,
  ) {
    const role = await this.findOne(id, organizationId);

    // No permitir editar roles del sistema
    if (role.isSystem) {
      throw new BadRequestException('No se pueden editar roles del sistema');
    }

    // No permitir editar roles de otra organización
    if (role.organizationId !== organizationId && role.scope !== RoleScope.GLOBAL) {
      throw new BadRequestException(
        'No tienes permisos para editar este rol',
      );
    }

    const { permissionIds, ...roleData } = updateRoleDto;

    return this.prisma.role.update({
      where: { id },
      data: {
        ...roleData,
        permissions: permissionIds
          ? {
              deleteMany: {},
              create: permissionIds.map((permissionId) => ({
                permissionId,
              })),
            }
          : undefined,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        organization: true,
      },
    });
  }

  /**
   * Eliminar un rol
   */
  async remove(id: string, organizationId: string) {
    const role = await this.findOne(id, organizationId);

    // No permitir eliminar roles del sistema
    if (role.isSystem) {
      throw new BadRequestException('No se pueden eliminar roles del sistema');
    }

    // No permitir eliminar roles de otra organización
    if (role.organizationId !== organizationId && role.scope !== RoleScope.GLOBAL) {
      throw new BadRequestException(
        'No tienes permisos para eliminar este rol',
      );
    }

    // Verificar si el rol tiene usuarios asignados
    const usersCount = await this.prisma.userRole.count({
      where: { roleId: id },
    });

    if (usersCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar el rol porque tiene ${usersCount} usuario(s) asignado(s)`,
      );
    }

    await this.prisma.role.delete({
      where: { id },
    });

    return { message: 'Rol eliminado exitosamente' };
  }

  /**
   * Asignar permisos a un rol
   */
  async assignPermissions(
    id: string,
    assignPermissionsDto: AssignPermissionsDto,
    organizationId: string,
  ) {
    const role = await this.findOne(id, organizationId);

    // No permitir editar roles del sistema
    if (role.isSystem) {
      throw new BadRequestException(
        'No se pueden modificar los permisos de roles del sistema',
      );
    }

    // Verificar que todos los permisos existen
    const permissions = await this.prisma.permission.findMany({
      where: {
        id: { in: assignPermissionsDto.permissionIds },
      },
    });

    if (permissions.length !== assignPermissionsDto.permissionIds.length) {
      throw new BadRequestException('Uno o más permisos no existen');
    }

    // Reemplazar permisos
    await this.prisma.role.update({
      where: { id },
      data: {
        permissions: {
          deleteMany: {},
          create: assignPermissionsDto.permissionIds.map((permissionId) => ({
            permissionId,
          })),
        },
      },
    });

    return this.findOne(id, organizationId);
  }

  /**
   * Asignar rol a un usuario
   */
  async assignRoleToUser(
    userId: string,
    roleId: string,
    organizationId: string,
  ) {
    // Verificar que el rol existe y está disponible para la organización
    const role = await this.findOne(roleId, organizationId);

    // Verificar que el usuario existe y pertenece a la organización
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        organizationId,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new NotFoundException(
        `Usuario con ID ${userId} no encontrado en esta organización`,
      );
    }

    // Verificar si ya tiene el rol asignado
    const existingAssignment = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId_organizationId: {
          userId,
          roleId,
          organizationId,
        },
      },
    });

    if (existingAssignment) {
      throw new ConflictException('El usuario ya tiene este rol asignado');
    }

    // Asignar el rol
    const userRole = await this.prisma.userRole.create({
      data: {
        userId,
        roleId,
        organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
          },
        },
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

    return userRole;
  }

  /**
   * Remover rol de un usuario
   */
  async removeRoleFromUser(
    userId: string,
    roleId: string,
    organizationId: string,
  ) {
    const userRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId_organizationId: {
          userId,
          roleId,
          organizationId,
        },
      },
    });

    if (!userRole) {
      throw new NotFoundException(
        'El usuario no tiene este rol asignado en esta organización',
      );
    }

    await this.prisma.userRole.delete({
      where: {
        userId_roleId_organizationId: {
          userId,
          roleId,
          organizationId,
        },
      },
    });

    return { message: 'Rol removido del usuario exitosamente' };
  }

  /**
   * Obtener roles de un usuario en una organización
   */
  async getUserRoles(userId: string, organizationId: string) {
    return this.prisma.userRole.findMany({
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
  }
}
