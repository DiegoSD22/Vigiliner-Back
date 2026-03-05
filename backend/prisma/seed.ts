import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash de contraseñas
  const passwordHash = await bcrypt.hash('password123', 10);

  // Usuario Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vigiliner.com' },
    update: {},
    create: {
      email: 'admin@vigiliner.com',
      password: passwordHash,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Usuario normal
  const user = await prisma.user.upsert({
    where: { email: 'user@vigiliner.com' },
    update: {},
    create: {
      email: 'user@vigiliner.com',
      password: passwordHash,
      name: 'Usuario Normal',
      role: 'USER',
    },
  });

  console.log('✅ Regular user created:', user.email);

  console.log('\n📋 Credenciales de prueba:');
  console.log('┌─────────────────────────────────────────┐');
  console.log('│ Email: admin@vigiliner.com              │');
  console.log('│ Password: password123                   │');
  console.log('│ Role: ADMIN                             │');
  console.log('├─────────────────────────────────────────┤');
  console.log('│ Email: user@vigiliner.com               │');
  console.log('│ Password: password123                   │');
  console.log('│ Role: USER                              │');
  console.log('└─────────────────────────────────────────┘');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
