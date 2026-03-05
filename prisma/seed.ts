import 'dotenv/config';
import { PrismaClient } from './generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import {
  clearOrganizationsAndUsers,
  seedOrganizationsAndUsers,
} from './seeders/organization-user.seeder';
import { generateSeedOrganizations } from './seed-data';

function assertSeedAllowed(): void {
  const isProd = process.env.NODE_ENV === 'production';
  const allowProdSeed = process.env.ALLOW_PROD_SEED === 'true';

  if (isProd && !allowProdSeed) {
    throw new Error(
      'Seeding bloqueado en production. Usa ALLOW_PROD_SEED=true solo si estás totalmente seguro.',
    );
  }
}

function hasResetFlag(): boolean {
  return process.argv.includes('--reset');
}

async function main(): Promise<void> {
  assertSeedAllowed();

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  const shouldReset = hasResetFlag();
  const seedOrganizations = generateSeedOrganizations();

  try {
    if (shouldReset) {
      console.log('[seed] Limpiando datos existentes...');
      await clearOrganizationsAndUsers(prisma);
    }

    console.log('[seed] Insertando datos de prueba generados con faker...');
    console.log(
      `[seed] Organizaciones: ${seedOrganizations.length}, Usuarios: ${seedOrganizations.reduce((acc, org) => acc + org.users.length, 0)}`,
    );
    await seedOrganizationsAndUsers(prisma, seedOrganizations);

    console.log('[seed] Seed completado correctamente.');
    console.log('[seed] Credenciales demo:');

    const uniqueUsers = seedOrganizations.flatMap((org) =>
      org.users.map((u) => ({
        email: u.email,
        username: u.username,
        password: u.password,
      })),
    );

    for (const user of uniqueUsers) {
      console.log(
        `- email: ${user.email} | username: ${user.username} | password: ${user.password}`,
      );
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('[seed] Error ejecutando seed:', error);
  process.exit(1);
});
