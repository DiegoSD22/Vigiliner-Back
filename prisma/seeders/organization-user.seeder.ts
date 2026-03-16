import { PrismaClient } from '../generated/client';
import * as bcrypt from 'bcrypt';
import { SeedOrganization } from '../seed-data';

const BCRYPT_ROUNDS = 10;

export async function seedOrganizationsAndUsers(
  prisma: PrismaClient,
  organizations: SeedOrganization[],
): Promise<void> {
  // Buscar los roles para asignar a usuarios
  const superAdminRole = await prisma.role.findFirst({
    where: { slug: 'super-admin' },
  });

  const orgAdminRole = await prisma.role.findFirst({
    where: { slug: 'org-admin' },
  });

  for (const [orgIndex, org] of organizations.entries()) {
    const savedOrg = await prisma.organization.upsert({
      where: { slug: org.slug },
      update: {
        name: org.name,
        status: org.status,
        deletedAt: null,
      },
      create: {
        name: org.name,
        slug: org.slug,
        status: org.status,
      },
    });

    for (const [userIndex, user] of org.users.entries()) {
      const hashedPassword = await bcrypt.hash(user.password, BCRYPT_ROUNDS);

      const savedUser = await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          username: user.username,
          password: hashedPassword,
          organizationId: savedOrg.id,
          deletedAt: null,
        },
        create: {
          email: user.email,
          username: user.username,
          name: user.name,
          password: hashedPassword,
          organizationId: savedOrg.id,
        },
      });

      // Asignar rol super-admin al usuario super-admin (primer usuario de primera org)
      // El rol super-admin es global, así que se asigna en cualquier organización
      if (
        orgIndex === 0 &&
        userIndex === 0 &&
        user.username === 'super-admin' &&
        superAdminRole
      ) {
        await prisma.userRole.upsert({
          where: {
            userId_roleId_organizationId: {
              userId: savedUser.id,
              roleId: superAdminRole.id,
              organizationId: savedOrg.id,
            },
          },
          update: {},
          create: {
            userId: savedUser.id,
            roleId: superAdminRole.id,
            organizationId: savedOrg.id,
          },
        });

        console.log(
          `  ✓ Rol "super-admin" asignado a usuario "${user.username}" (acceso global)`,
        );
      }

      // Asignar rol org-admin al usuario admin (segundo usuario de primera org)
      if (
        orgIndex === 0 &&
        userIndex === 1 &&
        user.username === 'admin' &&
        orgAdminRole
      ) {
        await prisma.userRole.upsert({
          where: {
            userId_roleId_organizationId: {
              userId: savedUser.id,
              roleId: orgAdminRole.id,
              organizationId: savedOrg.id,
            },
          },
          update: {},
          create: {
            userId: savedUser.id,
            roleId: orgAdminRole.id,
            organizationId: savedOrg.id,
          },
        });

        console.log(
          `  ✓ Rol "org-admin" asignado a usuario "${user.username}" en organización "${savedOrg.name}"`,
        );
      }
    }
  }
}

export async function clearOrganizationsAndUsers(
  prisma: PrismaClient,
): Promise<void> {
  await prisma.$transaction([
    prisma.user.deleteMany({}),
    prisma.organization.deleteMany({}),
  ]);
}
