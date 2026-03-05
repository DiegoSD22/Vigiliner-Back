import { PrismaClient } from '../generated/client';
import { SEED_ROLES } from '../roles-data';

/**
 * Sembrar roles predefinidos del sistema con sus permisos
 * 
 * Usa upsert para idempotencia, permitiendo ejecutar múltiples veces
 */
export async function seedRoles(prisma: PrismaClient): Promise<void> {
  console.log('👥 Sembrando roles predefinidos...');

  for (const roleData of SEED_ROLES) {
    // Buscar los permisos por slug
    const permissions = await prisma.permission.findMany({
      where: {
        slug: {
          in: roleData.permissions,
        },
      },
    });

    if (permissions.length !== roleData.permissions.length) {
      const foundSlugs = permissions.map((p) => p.slug);
      const missingSlugs = roleData.permissions.filter(
        (slug) => !foundSlugs.includes(slug),
      );
      console.warn(
        `  ⚠️  Advertencia: Rol "${roleData.slug}" tiene permisos faltantes: ${missingSlugs.join(', ')}`,
      );
    }

    // Upsert del rol - No usar unique constraint porque organizationId puede ser null
    // En su lugar, usar findFirst + create o update manual
    const existing = await prisma.role.findFirst({
      where: {
        slug: roleData.slug,
        organizationId: null,
      },
    });

    let role;
    if (existing) {
      role = await prisma.role.update({
        where: { id: existing.id },
        data: {
          name: roleData.name,
          description: roleData.description,
          scope: roleData.scope,
          isSystem: roleData.isSystem,
        },
      });
    } else {
      role = await prisma.role.create({
        data: {
          name: roleData.name,
          slug: roleData.slug,
          description: roleData.description,
          scope: roleData.scope,
          isSystem: roleData.isSystem,
          organizationId: null,
        },
      });
    }

    // Eliminar permisos existentes y agregar los nuevos
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    await prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({
        roleId: role.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });

    console.log(
      `  ✓ Rol: ${roleData.slug} (${permissions.length} permisos)`,
    );
  }

  console.log(`✅ ${SEED_ROLES.length} roles sembrados`);
}

/**
 * Limpiar todos los roles (solo para desarrollo)
 */
export async function clearRoles(prisma: PrismaClient): Promise<void> {
  console.log('🗑️  Limpiando roles...');

  // Primero eliminar asignaciones de roles a usuarios
  await prisma.userRole.deleteMany({});

  // Luego eliminar roles
  await prisma.role.deleteMany({});

  console.log('✅ Roles eliminados');
}
