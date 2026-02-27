import { PrismaClient } from '@prisma/client';
import { createSoftDeleteMiddleware } from 'prisma-extension-soft-delete';

const prisma = new PrismaClient();

prisma.$use(
  createSoftDeleteMiddleware({
    models: {
      User: {
        field: 'deletedAt',
        createValue: (deleted) => deleted ? new Date() : null,
      },
      Unit: {
        field: 'deletedAt',
        createValue: (deleted) => deleted ? new Date() : null,
      },
      Device: {
        field: 'deletedAt',
        createValue: (deleted) => deleted ? new Date() : null,
      },
    },
  })
);

export default prisma;
