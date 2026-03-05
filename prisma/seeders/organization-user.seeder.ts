import { PrismaClient } from '../generated/client';
import * as bcrypt from 'bcrypt';
import { SeedOrganization } from '../seed-data';

const BCRYPT_ROUNDS = 10;

export async function seedOrganizationsAndUsers(
  prisma: PrismaClient,
  organizations: SeedOrganization[],
): Promise<void> {
  for (const org of organizations) {
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

    for (const user of org.users) {
      const hashedPassword = await bcrypt.hash(user.password, BCRYPT_ROUNDS);

      await prisma.user.upsert({
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
