import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreatePermissionDto, UpdatePermissionDto } from './dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear un nuevo permiso
   */
  async create(createPermissionDto: CreatePermissionDto) {
    const { resource, action, name, description } = createPermissionDto;

    // Generar slug automáticamente: resource:action
    const slug = `${resource}:${action}`;

    // Verificar si ya existe un permiso con el mismo slug
    const existingPermission = await this.prisma.permission.findUnique({
      where: { slug },
    });

    if (existingPermission) {
      throw new ConflictException(
        `Ya existe un permiso para "${resource}:${action}"`,
      );
    }

    return this.prisma.permission.create({
      data: {
        name,
        slug,
        resource,
        action,
        description,
      },
    });
  }

  /**
   * Listar todos los permisos
   */
  async findAll(resource?: string) {
    return this.prisma.permission.findMany({
      where: resource ? { resource } : undefined,
      include: {
        _count: {
          select: {
            roles: true,
          },
        },
      },
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });
  }

  /**
   * Obtener un permiso por ID
   */
  async findOne(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: {
              include: {
                organization: true,
              },
            },
          },
        },
        _count: {
          select: {
            roles: true,
          },
        },
      },
    });

    if (!permission) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    return permission;
  }

  /**
   * Actualizar un permiso
   */
  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    await this.findOne(id);

    return this.prisma.permission.update({
      where: { id },
      data: updatePermissionDto,
    });
  }

  /**
   * Eliminar un permiso
   */
  async remove(id: string) {
    const permission = await this.findOne(id);

    // Verificar si el permiso está asignado a algún rol
    const rolesCount = await this.prisma.rolePermission.count({
      where: { permissionId: id },
    });

    if (rolesCount > 0) {
      throw new ConflictException(
        `No se puede eliminar el permiso porque está asignado a ${rolesCount} rol(es)`,
      );
    }

    await this.prisma.permission.delete({
      where: { id },
    });

    return { message: 'Permiso eliminado exitosamente' };
  }

  /**
   * Obtener todos los recursos únicos
   */
  async getResources(): Promise<string[]> {
    const permissions = await this.prisma.permission.findMany({
      select: {
        resource: true,
      },
      distinct: ['resource'],
      orderBy: {
        resource: 'asc',
      },
    });

    return permissions.map((p) => p.resource);
  }

  /**
   * Obtener permisos agrupados por recurso
   */
  async findGroupedByResource() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
      include: {
        _count: {
          select: {
            roles: true,
          },
        },
      },
    });

    // Agrupar por recurso
    const grouped = permissions.reduce(
      (acc, permission) => {
        if (!acc[permission.resource]) {
          acc[permission.resource] = [];
        }
        acc[permission.resource].push(permission);
        return acc;
      },
      {} as Record<string, typeof permissions>,
    );

    return grouped;
  }
}
