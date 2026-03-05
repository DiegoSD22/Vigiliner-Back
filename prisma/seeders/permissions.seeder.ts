import { PrismaClient } from '../generated/client';
import { SEED_PERMISSIONS } from '../permissions-data';

/**
 * Sembrar permisos predefinidos del sistema
 * 
 * Usa upsert para idempotencia, permitiendo ejecutar múltiples veces
 */
export async function seedPermissions(prisma: PrismaClient): Promise<void> {
  console.log('📝 Sembrando permisos predefinidos...');

  for (const permissionData of SEED_PERMISSIONS) {
    const slug = `${permissionData.resource}:${permissionData.action}`;

    await prisma.permission.upsert({
      where: { slug },
      update: {
        name: permissionData.name,
        description: permissionData.description,
      },
      create: {
        name: permissionData.name,
        slug,
        resource: permissionData.resource,
        action: permissionData.action,
        description: permissionData.description,
      },
    });

    console.log(`  ✓ Permiso: ${slug}`);
  }

  console.log(`✅ ${SEED_PERMISSIONS.length} permisos sembrados`);
}

/**
 * Limpiar todos los permisos (solo para desarrollo)
 */
export async function clearPermissions(prisma: PrismaClient): Promise<void> {
  console.log('🗑️  Limpiando permisos...');

  await prisma.permission.deleteMany({});

  console.log('✅ Permisos eliminados');
}
